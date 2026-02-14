#!/usr/bin/env python3

# Test the safeguarding keyword matching
SAFEGUARDING_KEYWORDS = [
    "kill myself", "want to die", "end my life", "suicide",
    "self harm", "self-harm", "cut myself", "hurt myself",
    "no reason to live", "end it all", "better off dead",
    "can't go on", "give up on life", "take my life",
    "don't want to be here", "want to disappear", "overdose",
    "jump off", "hang myself", "slit my wrists"
]

def check_safeguarding_content(text: str) -> dict:
    """
    Check text for safeguarding concerns and return risk level with resources
    """
    if not text:
        return {"flagged": False, "risk_level": "none", "matched_keywords": []}
    
    text_lower = text.lower()
    matched_keywords = []
    
    for keyword in SAFEGUARDING_KEYWORDS:
        if keyword in text_lower:
            matched_keywords.append(keyword)
    
    if len(matched_keywords) >= 2:
        risk_level = "high"
    elif len(matched_keywords) == 1:
        risk_level = "medium"
    else:
        risk_level = "none"
    
    return {
        "flagged": len(matched_keywords) > 0,
        "risk_level": risk_level,
        "matched_keywords": matched_keywords
    }

# Test cases
test_cases = [
    "I want to kill myself. I can't take this anymore.",
    "I feel like ending it all. There's no point in continuing.",
    "I want to end it all",
    "I feel like I want to end my life"
]

for i, text in enumerate(test_cases, 1):
    result = check_safeguarding_content(text)
    print(f"Test {i}: {text}")
    print(f"  Result: {result}")
    print()