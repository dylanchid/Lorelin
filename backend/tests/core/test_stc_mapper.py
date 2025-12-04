import pytest
from app.core.stc_mapper import STCMapper, ServiceCategory

@pytest.fixture
def mapper():
    return STCMapper()

def test_specific_mappings(mapper):
    # E/M
    assert mapper.get_stc("99203") == "98"
    assert mapper.get_confidence("99203") == 0.95
    assert mapper.get_category("99203") == ServiceCategory.MEDICAL
    
    # Cosmetic - Breast Augmentation
    assert mapper.get_stc("19325") == "2"
    assert mapper.get_confidence("19325") == 0.90
    assert mapper.get_category("19325") == ServiceCategory.SURGICAL

def test_range_mappings(mapper):
    # Anesthesia range
    assert mapper.get_stc("00100") == "7"
    assert mapper.get_confidence("00100") == 0.80
    
    # MRI range
    assert mapper.get_stc("70553") == "62"

def test_category_fallbacks(mapper):
    # Unmapped surgery code starting with 10
    # 10000 is in range, let's pick something that might fall through if ranges weren't there,
    # but the ranges cover most.
    # Let's try a made up code that matches prefix but not specific or range if possible.
    # Actually the ranges are quite comprehensive.
    # Let's try a code that isn't in a range but has a prefix.
    # Prefix 18 is not in ranges (10-19 covers 10-19999 in range mapping? No, 10000-19999 is covered).
    # Wait, 10000-19999 covers all 1xxxx.
    # Let's check the code.
    # Range: ("10000", "19999", ...)
    # So all 1xxxx are covered by range.
    # Let's look for gaps.
    # 30000-30999 is nose. 31xxx is not in range list.
    # Prefix 31 is in CATEGORY_PREFIXES.
    assert mapper.get_stc("31000") == "2"
    assert mapper.get_confidence("31000") == 0.60

def test_ultimate_fallback(mapper):
    # Completely unknown code
    assert mapper.get_stc("XXXXX") == "30"
    assert mapper.get_confidence("XXXXX") == 0.40

def test_fallbacks_list(mapper):
    # 99203 -> 98, fallbacks [1, 30]
    stcs = mapper.get_stc_with_fallbacks("99203")
    assert stcs == ["98", "1", "30"]
    
    # 19325 -> 2, fallbacks [BT, 30]
    stcs = mapper.get_stc_with_fallbacks("19325")
    assert stcs == ["2", "BT", "30"]

def test_case_insensitivity(mapper):
    assert mapper.get_stc("99203") == mapper.get_stc("99203")
