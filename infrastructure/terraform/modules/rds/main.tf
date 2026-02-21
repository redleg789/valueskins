# RDS PostgreSQL — Multi-AZ with encryption, automated backups, read replicas
# RTO < 5 min via automated failover, RPO < 1 min via WAL streaming

variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "instance_class" { type = string }
variable "allocated_storage" { type = number }
variable "multi_az" { type = bool }
variable "backup_retention_days" { type = number }
variable "db_name" { type = string }
variable "allowed_security_groups" { type = list(string) }

resource "random_password" "master" {
  length  = 32
  special = false
}

resource "aws_db_subnet_group" "main" {
  name       = "valueskins-${var.environment}"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "rds" {
  name_prefix = "valueskins-rds-${var.environment}-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.allowed_security_groups
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_kms_key" "rds" {
  description         = "RDS encryption for valueskins-${var.environment}"
  enable_key_rotation = true
}

resource "aws_db_instance" "main" {
  identifier     = "valueskins-${var.environment}"
  engine         = "postgres"
  engine_version = "16.3"
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.allocated_storage * 4
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.rds.arn

  db_name  = var.db_name
  username = "valueskins_admin"
  password = random_password.master.result

  multi_az               = var.multi_az
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period   = var.backup_retention_days
  backup_window             = "03:00-04:00"
  maintenance_window        = "Mon:04:00-Mon:05:00"
  copy_tags_to_snapshot     = true
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "valueskins-${var.environment}-final"

  performance_insights_enabled    = true
  monitoring_interval             = 60
  monitoring_role_arn             = aws_iam_role.rds_monitoring.arn
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  parameter_group_name = aws_db_parameter_group.main.name
}

resource "aws_db_parameter_group" "main" {
  name_prefix = "valueskins-pg16-"
  family      = "postgres16"

  parameter {
    name  = "log_statement"
    value = "ddl"
  }
  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }
  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Read replica for analytics queries
resource "aws_db_instance" "read_replica" {
  identifier          = "valueskins-${var.environment}-read"
  replicate_source_db = aws_db_instance.main.identifier
  instance_class      = var.instance_class
  storage_encrypted   = true
  kms_key_id          = aws_kms_key.rds.arn

  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn          = aws_iam_role.rds_monitoring.arn
}

resource "aws_iam_role" "rds_monitoring" {
  name = "valueskins-${var.environment}-rds-monitoring"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

output "endpoint" { value = aws_db_instance.main.endpoint }
output "read_endpoint" { value = aws_db_instance.read_replica.endpoint }
output "master_password" { value = random_password.master.result sensitive = true }
