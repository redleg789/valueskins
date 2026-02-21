# Valueskins Production Infrastructure
# Multi-AZ deployment on AWS for high availability
# All infrastructure defined as code — reproducible across environments

terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "valueskins-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "valueskins"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Secondary region for disaster recovery
provider "aws" {
  alias  = "dr"
  region = var.dr_region

  default_tags {
    tags = {
      Project     = "valueskins"
      Environment = "${var.environment}-dr"
      ManagedBy   = "terraform"
    }
  }
}

# ── Networking ───────────────────────────────────────────────────────
module "vpc" {
  source = "./modules/vpc"

  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

# ── Kubernetes Cluster ───────────────────────────────────────────────
module "eks" {
  source = "./modules/eks"

  environment    = var.environment
  cluster_name   = "${var.project}-${var.environment}"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  node_min       = var.eks_node_min
  node_max       = var.eks_node_max
  node_instance  = var.eks_node_instance
}

# ── Database (Multi-AZ RDS) ─────────────────────────────────────────
module "rds" {
  source = "./modules/rds"

  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.data_subnet_ids
  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_storage_gb
  multi_az              = true
  backup_retention_days = var.rds_backup_retention
  db_name               = "valueskins"
  allowed_security_groups = [module.eks.node_security_group_id]
}

# ── Cache (ElastiCache Redis) ────────────────────────────────────────
module "redis" {
  source = "./modules/redis"

  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.data_subnet_ids
  node_type      = var.redis_node_type
  num_cache_nodes = var.redis_num_nodes
  allowed_security_groups = [module.eks.node_security_group_id]
}

# ── Message Queue (MSK Kafka) ───────────────────────────────────────
module "kafka" {
  source = "./modules/kafka"

  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.data_subnet_ids
  broker_count   = var.kafka_broker_count
  instance_type  = var.kafka_instance_type
  allowed_security_groups = [module.eks.node_security_group_id]
}

# ── Secrets Management ───────────────────────────────────────────────
module "secrets" {
  source = "./modules/secrets"

  environment = var.environment
  project     = var.project
  rds_endpoint = module.rds.endpoint
  rds_password = module.rds.master_password
  redis_endpoint = module.redis.endpoint
}
