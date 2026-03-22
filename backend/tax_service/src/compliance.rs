//! Tax compliance helpers
//! W-9, tax ID validation, withholding calculations

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxIdentification {
    pub creator_id: String,
    pub entity_type: String,        // "individual", "business"
    pub tax_id: String,             // SSN or EIN
    pub tax_id_type: String,        // "ssn" or "ein"
    pub verified: bool,
}

pub struct TaxCompliance;

impl TaxCompliance {
    /// Check if creator needs W-9 on file (>$600 earnings)
    pub fn needs_w9(annual_earnings: i32) -> bool {
        annual_earnings >= 60000  // $600.00
    }

    /// Calculate federal withholding
    /// Simplified: 10% for non-verified, 0% for verified TINs
    pub fn calculate_federal_withholding(
        gross_amount: i32,
        tax_id_verified: bool,
    ) -> i32 {
        if tax_id_verified {
            0
        } else {
            (gross_amount as f32 * 0.10) as i32
        }
    }

    /// Calculate state withholding (varies by state)
    pub fn calculate_state_withholding(
        gross_amount: i32,
        state_code: &str,
    ) -> i32 {
        match state_code {
            "CA" => (gross_amount as f32 * 0.093) as i32,
            "NY" => (gross_amount as f32 * 0.062) as i32,
            "TX" => 0, // No state income tax
            _ => 0,
        }
    }

    /// Validate US tax ID format
    pub fn validate_ssn(ssn: &str) -> bool {
        let digits: String = ssn.chars().filter(|c| c.is_numeric()).collect();
        if digits.len() != 9 {
            return false;
        }
        // Basic validation: no all zeros/ones
        digits != "000000000" && digits != "111111111"
    }

    /// Validate EIN format
    pub fn validate_ein(ein: &str) -> bool {
        let digits: String = ein.chars().filter(|c| c.is_numeric()).collect();
        digits.len() == 9
    }

    /// Get tax form requirement (1099-NEC, 1099-MISC, etc.)
    pub fn get_tax_form_type(entity_type: &str) -> String {
        match entity_type {
            "individual" => "1099-NEC".to_string(),
            "business" | "llc" | "corp" => "1099-MISC".to_string(),
            _ => "1099-NEC".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ssn_validation() {
        assert!(TaxCompliance::validate_ssn("123-45-6789"));
        assert!(TaxCompliance::validate_ssn("123456789"));
        assert!(!TaxCompliance::validate_ssn("000-00-0000"));
        assert!(!TaxCompliance::validate_ssn("12345")); // Too short
    }

    #[test]
    fn test_withholding_calculation() {
        assert_eq!(TaxCompliance::calculate_federal_withholding(100000, true), 0);
        assert_eq!(TaxCompliance::calculate_federal_withholding(100000, false), 10000);
    }

    #[test]
    fn test_w9_requirement() {
        assert!(!TaxCompliance::needs_w9(50000));
        assert!(TaxCompliance::needs_w9(60000));
        assert!(TaxCompliance::needs_w9(100000));
    }
}
