from typing import List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class ServiceCategory(Enum):
    SURGICAL = "surgical"
    MEDICAL = "medical"
    MENTAL_HEALTH = "mental_health"
    PHYSICAL_THERAPY = "physical_therapy"
    OCCUPATIONAL_THERAPY = "occupational_therapy"
    SPEECH_THERAPY = "speech_therapy"
    RADIOLOGY = "radiology"
    LABORATORY = "laboratory"
    VISION = "vision"
    DENTAL = "dental"
    DME = "dme"
    HOSPITAL = "hospital"
    EMERGENCY = "emergency"
    MATERNITY = "maternity"
    PHARMACY = "pharmacy"

@dataclass
class STCMapping:
    primary_stc: str
    fallback_stcs: List[str]
    category: ServiceCategory
    confidence: float  # 0.0 - 1.0

class STCMapper:
    """
    Maps CPT codes to Service Type Codes (STCs) for 270 eligibility requests.
    Uses tiered lookup: specific CPT → CPT range → category → generic fallback.
    """
    
    # Specific CPT → STC mappings (highest confidence)
    SPECIFIC_MAPPINGS: dict[str, STCMapping] = {
        # E/M Office Visits
        "99202": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.95),
        "99203": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.95),
        "99204": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.95),
        "99205": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.95),
        "99211": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.95),
        "99212": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.95),
        "99213": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.95),
        "99214": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.95),
        "99215": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.95),
        
        # Breast Procedures (common in cosmetic surgery)
        "19316": STCMapping("2", ["BT", "30"], ServiceCategory.SURGICAL, 0.90),
        "19318": STCMapping("2", ["BT", "30"], ServiceCategory.SURGICAL, 0.90),
        "19325": STCMapping("2", ["BT", "30"], ServiceCategory.SURGICAL, 0.90),
        "19357": STCMapping("2", ["BT", "47", "30"], ServiceCategory.SURGICAL, 0.90),
        "19361": STCMapping("2", ["BT", "47", "30"], ServiceCategory.SURGICAL, 0.90),
        
        # Rhinoplasty
        "30400": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "30410": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "30420": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "30430": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "30435": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "30450": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        
        # Blepharoplasty/Eyelid
        "15820": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.90),
        "15821": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.90),
        "15822": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.90),
        "15823": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.90),
        "67900": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.90),
        "67901": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.90),
        "67902": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.90),
        "67903": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.90),
        "67904": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.90),
        
        # Facelift
        "15828": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15829": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        
        # Abdominoplasty/Body Contouring
        "15830": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15832": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15833": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15834": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15835": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15836": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15837": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15838": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15847": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        
        # Liposuction
        "15876": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15877": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15878": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        "15879": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.90),
        
        # Mental Health
        "90791": STCMapping("MH", ["A4", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "90792": STCMapping("MH", ["A4", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "90832": STCMapping("A6", ["MH", "A4", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "90834": STCMapping("A6", ["MH", "A4", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "90837": STCMapping("A6", ["MH", "A4", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "90853": STCMapping("A6", ["MH", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        
        # Physical Therapy
        "97110": STCMapping("PT", ["AE", "30"], ServiceCategory.PHYSICAL_THERAPY, 0.95),
        "97112": STCMapping("PT", ["AE", "30"], ServiceCategory.PHYSICAL_THERAPY, 0.95),
        "97116": STCMapping("PT", ["AE", "30"], ServiceCategory.PHYSICAL_THERAPY, 0.95),
        "97140": STCMapping("PT", ["AE", "33", "30"], ServiceCategory.PHYSICAL_THERAPY, 0.90),
        "97161": STCMapping("PT", ["AE", "30"], ServiceCategory.PHYSICAL_THERAPY, 0.95),
        "97162": STCMapping("PT", ["AE", "30"], ServiceCategory.PHYSICAL_THERAPY, 0.95),
        "97163": STCMapping("PT", ["AE", "30"], ServiceCategory.PHYSICAL_THERAPY, 0.95),
        
        # Occupational Therapy
        "97165": STCMapping("AD", ["AE", "30"], ServiceCategory.OCCUPATIONAL_THERAPY, 0.95),
        "97166": STCMapping("AD", ["AE", "30"], ServiceCategory.OCCUPATIONAL_THERAPY, 0.95),
        "97167": STCMapping("AD", ["AE", "30"], ServiceCategory.OCCUPATIONAL_THERAPY, 0.95),
        "97168": STCMapping("AD", ["AE", "30"], ServiceCategory.OCCUPATIONAL_THERAPY, 0.95),
        
        # Speech Therapy
        "92507": STCMapping("AF", ["30"], ServiceCategory.SPEECH_THERAPY, 0.95),
        "92508": STCMapping("AF", ["30"], ServiceCategory.SPEECH_THERAPY, 0.95),
        "92521": STCMapping("AF", ["30"], ServiceCategory.SPEECH_THERAPY, 0.95),
        "92522": STCMapping("AF", ["30"], ServiceCategory.SPEECH_THERAPY, 0.95),
        "92523": STCMapping("AF", ["30"], ServiceCategory.SPEECH_THERAPY, 0.95),
        "92526": STCMapping("AF", ["30"], ServiceCategory.SPEECH_THERAPY, 0.95),
        
        # Vision
        "92002": STCMapping("EE", ["AL", "67", "30"], ServiceCategory.VISION, 0.95),
        "92004": STCMapping("EE", ["AL", "67", "30"], ServiceCategory.VISION, 0.95),
        "92012": STCMapping("EE", ["AL", "67", "30"], ServiceCategory.VISION, 0.95),
        "92014": STCMapping("EE", ["AL", "67", "30"], ServiceCategory.VISION, 0.95),
        
        # Chemotherapy
        "96401": STCMapping("78", ["ON", "87", "92", "30"], ServiceCategory.MEDICAL, 0.95),
        "96413": STCMapping("78", ["ON", "87", "92", "30"], ServiceCategory.MEDICAL, 0.95),
        
        # Acupuncture
        "97810": STCMapping("64", ["1", "30"], ServiceCategory.MEDICAL, 0.90),
        "97811": STCMapping("64", ["1", "30"], ServiceCategory.MEDICAL, 0.90),
        "97813": STCMapping("64", ["1", "30"], ServiceCategory.MEDICAL, 0.90),
        "97814": STCMapping("64", ["1", "30"], ServiceCategory.MEDICAL, 0.90),
        
        # ABA Therapy
        "97151": STCMapping("BD", ["MH", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "97152": STCMapping("BD", ["MH", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "97153": STCMapping("BD", ["MH", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "97154": STCMapping("BD", ["MH", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "97155": STCMapping("BD", ["MH", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "97156": STCMapping("BD", ["MH", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
        "97157": STCMapping("BD", ["MH", "30"], ServiceCategory.MENTAL_HEALTH, 0.95),
    }
    
    # CPT Range → STC mappings (medium confidence)
    RANGE_MAPPINGS: list[Tuple[str, str, STCMapping]] = [
        # E/M codes
        ("99201", "99205", STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.85)),
        ("99211", "99215", STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.85)),
        ("99221", "99223", STCMapping("A0", ["47", "48", "30"], ServiceCategory.HOSPITAL, 0.85)),
        ("99231", "99233", STCMapping("A0", ["47", "48", "30"], ServiceCategory.HOSPITAL, 0.85)),
        ("99281", "99285", STCMapping("86", ["47", "52", "30"], ServiceCategory.EMERGENCY, 0.90)),
        ("99304", "99318", STCMapping("AG", ["AH", "54", "30"], ServiceCategory.MEDICAL, 0.85)),
        
        # Anesthesia
        ("00100", "01999", STCMapping("7", ["2", "47", "30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Surgery - Integumentary
        ("10000", "19999", STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.80)),
        ("19000", "19499", STCMapping("2", ["BT", "30"], ServiceCategory.SURGICAL, 0.85)),
        
        # Surgery - Musculoskeletal
        ("20000", "29999", STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Surgery - Respiratory (Nose)
        ("30000", "30999", STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Surgery - Cardiovascular
        ("33000", "37799", STCMapping("2", ["BL", "47", "30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Surgery - Digestive
        ("40000", "49999", STCMapping("2", ["BN", "47", "30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Surgery - Urinary
        ("50000", "53899", STCMapping("2", ["RN", "30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Surgery - Male Genital
        ("54000", "55899", STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Surgery - Female Genital
        ("56000", "58999", STCMapping("2", ["BV", "69", "30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Surgery - Maternity
        ("59000", "59899", STCMapping("BU", ["BV", "69", "30"], ServiceCategory.MATERNITY, 0.90)),
        
        # Surgery - Nervous System
        ("61000", "64999", STCMapping("2", ["BQ", "30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Surgery - Eye
        ("65000", "68999", STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.85)),
        
        # Surgery - Auditory
        ("69000", "69990", STCMapping("2", ["71", "77", "30"], ServiceCategory.SURGICAL, 0.80)),
        
        # Radiology - CT (Moved above Diagnostic for priority)
        ("70450", "70498", STCMapping("ED", ["4", "62", "30"], ServiceCategory.RADIOLOGY, 0.90)),
        
        # Radiology - MRI (Moved above Diagnostic for priority)
        ("70540", "70559", STCMapping("62", ["4", "73", "30"], ServiceCategory.RADIOLOGY, 0.90)),

        # Radiology - Diagnostic
        ("70000", "76999", STCMapping("4", ["62", "73", "30"], ServiceCategory.RADIOLOGY, 0.85)),
        
        # Radiology - Radiation Oncology
        ("77261", "77799", STCMapping("6", ["ON", "87", "30"], ServiceCategory.RADIOLOGY, 0.90)),
        
        # Radiology - Nuclear Medicine
        ("78000", "78999", STCMapping("73", ["4", "30"], ServiceCategory.RADIOLOGY, 0.85)),
        
        # Laboratory/Pathology
        ("80000", "89999", STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.85)),
        
        # Medicine - Immunizations
        ("90281", "90399", STCMapping("80", ["88", "30"], ServiceCategory.MEDICAL, 0.85)),
        
        # Medicine - Vaccines
        ("90460", "90759", STCMapping("80", ["88", "30"], ServiceCategory.MEDICAL, 0.85)),
        
        # Mental Health
        ("90785", "90899", STCMapping("MH", ["A4", "A6", "30"], ServiceCategory.MENTAL_HEALTH, 0.90)),
        ("96101", "96155", STCMapping("MH", ["A4", "30"], ServiceCategory.MENTAL_HEALTH, 0.85)),
        
        # Physical Medicine
        ("97000", "97799", STCMapping("PT", ["AE", "AD", "30"], ServiceCategory.PHYSICAL_THERAPY, 0.80)),
        
        # Chemotherapy
        ("96401", "96549", STCMapping("78", ["ON", "87", "30"], ServiceCategory.MEDICAL, 0.90)),
        
        # Dialysis
        ("90935", "90999", STCMapping("76", ["RN", "30"], ServiceCategory.MEDICAL, 0.90)),
        
        # Ophthalmology
        ("92002", "92499", STCMapping("EE", ["AL", "67", "30"], ServiceCategory.VISION, 0.85)),
        
        # Cardiovascular
        ("93000", "93999", STCMapping("BL", ["73", "30"], ServiceCategory.MEDICAL, 0.85)),
        
        # Pulmonary
        ("94002", "94799", STCMapping("PU", ["73", "30"], ServiceCategory.MEDICAL, 0.85)),
        
        # Allergy/Immunology
        ("95004", "95199", STCMapping("GY", ["79", "30"], ServiceCategory.MEDICAL, 0.85)),
        
        # Neurology
        ("95700", "96020", STCMapping("BQ", ["73", "30"], ServiceCategory.MEDICAL, 0.85)),
        
        # Dermatology
        ("96900", "96999", STCMapping("DG", ["1", "30"], ServiceCategory.MEDICAL, 0.85)),
    ]
    
    # Category prefix → STC (low confidence fallback)
    CATEGORY_PREFIXES: dict[str, STCMapping] = {
        "00": STCMapping("7", ["2", "30"], ServiceCategory.SURGICAL, 0.60),    # Anesthesia
        "10": STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.60),    # Integumentary
        "11": STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.60),
        "12": STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.60),
        "13": STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.60),
        "14": STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.60),
        "15": STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.60),
        "16": STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.60),
        "17": STCMapping("2", ["DG", "30"], ServiceCategory.SURGICAL, 0.60),
        "19": STCMapping("2", ["BT", "30"], ServiceCategory.SURGICAL, 0.65),   # Breast
        "20": STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.60),   # Musculoskeletal
        "21": STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.60),
        "22": STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.60),
        "23": STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.60),
        "24": STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.60),
        "25": STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.60),
        "26": STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.60),
        "27": STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.60),
        "28": STCMapping("2", ["93", "30"], ServiceCategory.SURGICAL, 0.60),   # Foot
        "29": STCMapping("2", ["BK", "30"], ServiceCategory.SURGICAL, 0.60),
        "30": STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.60),    # Nose
        "31": STCMapping("2", ["1", "30"], ServiceCategory.SURGICAL, 0.60),
        "32": STCMapping("2", ["PU", "30"], ServiceCategory.SURGICAL, 0.60),   # Lungs
        "33": STCMapping("2", ["BL", "30"], ServiceCategory.SURGICAL, 0.65),   # Heart
        "34": STCMapping("2", ["BL", "30"], ServiceCategory.SURGICAL, 0.65),
        "35": STCMapping("2", ["BL", "30"], ServiceCategory.SURGICAL, 0.65),
        "36": STCMapping("2", ["BL", "30"], ServiceCategory.SURGICAL, 0.65),
        "37": STCMapping("2", ["BL", "30"], ServiceCategory.SURGICAL, 0.65),
        "40": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),   # Digestive
        "41": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),
        "42": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),
        "43": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),
        "44": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),
        "45": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),
        "46": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),
        "47": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),
        "48": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),
        "49": STCMapping("2", ["BN", "30"], ServiceCategory.SURGICAL, 0.60),
        "50": STCMapping("2", ["RN", "30"], ServiceCategory.SURGICAL, 0.60),   # Urinary
        "51": STCMapping("2", ["RN", "30"], ServiceCategory.SURGICAL, 0.60),
        "52": STCMapping("2", ["RN", "30"], ServiceCategory.SURGICAL, 0.60),
        "53": STCMapping("2", ["RN", "30"], ServiceCategory.SURGICAL, 0.60),
        "54": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.60),         # Male Genital
        "55": STCMapping("2", ["30"], ServiceCategory.SURGICAL, 0.60),
        "56": STCMapping("2", ["BV", "30"], ServiceCategory.SURGICAL, 0.60),   # Female Genital
        "57": STCMapping("2", ["BV", "30"], ServiceCategory.SURGICAL, 0.60),
        "58": STCMapping("2", ["BV", "30"], ServiceCategory.SURGICAL, 0.60),
        "59": STCMapping("BU", ["BV", "69", "30"], ServiceCategory.MATERNITY, 0.70),  # Maternity
        "60": STCMapping("2", ["BP", "30"], ServiceCategory.SURGICAL, 0.60),   # Endocrine
        "61": STCMapping("2", ["BQ", "30"], ServiceCategory.SURGICAL, 0.60),   # Nervous
        "62": STCMapping("2", ["BQ", "30"], ServiceCategory.SURGICAL, 0.60),
        "63": STCMapping("2", ["BQ", "30"], ServiceCategory.SURGICAL, 0.60),
        "64": STCMapping("2", ["BQ", "30"], ServiceCategory.SURGICAL, 0.60),
        "65": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.65),   # Eye
        "66": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.65),
        "67": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.65),
        "68": STCMapping("2", ["EE", "30"], ServiceCategory.SURGICAL, 0.65),
        "69": STCMapping("2", ["71", "30"], ServiceCategory.SURGICAL, 0.60),   # Auditory
        "70": STCMapping("4", ["62", "30"], ServiceCategory.RADIOLOGY, 0.65),  # Radiology
        "71": STCMapping("4", ["62", "30"], ServiceCategory.RADIOLOGY, 0.65),
        "72": STCMapping("4", ["62", "30"], ServiceCategory.RADIOLOGY, 0.65),
        "73": STCMapping("4", ["62", "30"], ServiceCategory.RADIOLOGY, 0.65),
        "74": STCMapping("4", ["62", "30"], ServiceCategory.RADIOLOGY, 0.65),
        "75": STCMapping("4", ["62", "30"], ServiceCategory.RADIOLOGY, 0.65),
        "76": STCMapping("4", ["73", "30"], ServiceCategory.RADIOLOGY, 0.65),
        "77": STCMapping("6", ["ON", "30"], ServiceCategory.RADIOLOGY, 0.65),  # Radiation Oncology
        "78": STCMapping("73", ["4", "30"], ServiceCategory.RADIOLOGY, 0.65),  # Nuclear Medicine
        "79": STCMapping("4", ["73", "30"], ServiceCategory.RADIOLOGY, 0.65),
        "80": STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.65), # Laboratory
        "81": STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.65),
        "82": STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.65),
        "83": STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.65),
        "84": STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.65),
        "85": STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.65),
        "86": STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.65),
        "87": STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.65),
        "88": STCMapping("66", ["5", "30"], ServiceCategory.LABORATORY, 0.65), # Pathology
        "89": STCMapping("5", ["66", "30"], ServiceCategory.LABORATORY, 0.65),
        "90": STCMapping("MH", ["80", "30"], ServiceCategory.MEDICAL, 0.55),   # Medicine
        "91": STCMapping("1", ["30"], ServiceCategory.MEDICAL, 0.55),
        "92": STCMapping("EE", ["AL", "30"], ServiceCategory.VISION, 0.65),    # Eye Services
        "93": STCMapping("BL", ["73", "30"], ServiceCategory.MEDICAL, 0.65),   # Cardiovascular
        "94": STCMapping("PU", ["73", "30"], ServiceCategory.MEDICAL, 0.65),   # Pulmonary
        "95": STCMapping("BQ", ["GY", "30"], ServiceCategory.MEDICAL, 0.60),   # Neurology/Allergy
        "96": STCMapping("MH", ["78", "30"], ServiceCategory.MEDICAL, 0.55),   # Various
        "97": STCMapping("PT", ["AE", "AD", "30"], ServiceCategory.PHYSICAL_THERAPY, 0.70),
        "98": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.60),
        "99": STCMapping("98", ["1", "30"], ServiceCategory.MEDICAL, 0.70),    # E/M
    }
    
    def get_stc(self, cpt_code: str) -> str:
        """
        Returns the primary STC for a CPT code.
        """
        mapping = self._get_mapping(cpt_code)
        return mapping.primary_stc
    
    def get_stc_with_fallbacks(self, cpt_code: str) -> List[str]:
        """
        Returns ordered list of STCs to try (primary + fallbacks).
        """
        mapping = self._get_mapping(cpt_code)
        stcs = [mapping.primary_stc]
        for fallback in mapping.fallback_stcs:
            if fallback not in stcs:
                stcs.append(fallback)
        return stcs
    
    def get_mapping(self, cpt_code: str) -> STCMapping:
        """
        Returns full mapping details including confidence score.
        """
        return self._get_mapping(cpt_code)
    
    def _get_mapping(self, cpt_code: str) -> STCMapping:
        """
        Internal method to resolve CPT → STC mapping.
        Priority: specific → range → category prefix → ultimate fallback
        """
        # Normalize code
        cpt_code = cpt_code.strip().upper()
        
        # 1. Try specific mapping (highest confidence)
        if cpt_code in self.SPECIFIC_MAPPINGS:
            return self.SPECIFIC_MAPPINGS[cpt_code]
        
        # 2. Try range mappings (medium confidence)
        for start, end, mapping in self.RANGE_MAPPINGS:
            if start <= cpt_code <= end:
                return mapping
        
        # 3. Try category prefix (low confidence)
        prefix = cpt_code[:2]
        if prefix in self.CATEGORY_PREFIXES:
            return self.CATEGORY_PREFIXES[prefix]
        
        # 4. Ultimate fallback
        return STCMapping("30", ["1", "98"], ServiceCategory.MEDICAL, 0.40)
    
    def get_category(self, cpt_code: str) -> ServiceCategory:
        """
        Returns the service category for a CPT code.
        """
        return self._get_mapping(cpt_code).category
    
    def get_confidence(self, cpt_code: str) -> float:
        """
        Returns the confidence score (0-1) for the mapping.
        """
        return self._get_mapping(cpt_code).confidence
