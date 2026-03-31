from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import nsmap
from pptx.oxml import parse_xml
import os

# Create presentation
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Define colors as hex strings
DARK_BG = "0F172A"
PURPLE = "6366F1"
WHITE = "FFFFFF"
GRAY = "94A3B8"

def set_shape_fill(shape, hex_color):
    """Set shape fill color"""
    shape.fill.solid()
    shape.fill.fore_color.rgb = parse_hex_color(hex_color)

def parse_hex_color(hex_str):
    """Convert hex string to RGBColor"""
    from pptx.dml.color import RGBColor
    return RGBColor(int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16))

def set_font_color(font, hex_color):
    """Set font color"""
    font.color.rgb = parse_hex_color(hex_color)

def add_title_slide(prs, title, subtitle):
    """Add a title slide"""
    slide_layout = prs.slide_layouts[6]  # Blank
    slide = prs.slides.add_slide(slide_layout)
    
    # Background
    background = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    background.fill.solid()
    background.fill.fore_color.rgb = DARK_BG
    background.line.fill.background()
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(2.5), Inches(12.333), Inches(1.5))
    tf = title_box.text_frame
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.CENTER
    
    # Subtitle
    sub_box = slide.shapes.add_textbox(Inches(0.5), Inches(4), Inches(12.333), Inches(1))
    tf = sub_box.text_frame
    p = tf.paragraphs[0]
    p.text = subtitle
    p.font.size = Pt(24)
    p.font.color.rgb = GRAY
    p.alignment = PP_ALIGN.CENTER
    
    return slide

def add_content_slide(prs, title, description, image_path, bullets=None):
    """Add a content slide with image"""
    slide_layout = prs.slide_layouts[6]  # Blank
    slide = prs.slides.add_slide(slide_layout)
    
    # Background
    background = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    background.fill.solid()
    background.fill.fore_color.rgb = DARK_BG
    background.line.fill.background()
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(12.333), Inches(0.8))
    tf = title_box.text_frame
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = WHITE
    
    # Description
    desc_box = slide.shapes.add_textbox(Inches(0.5), Inches(1), Inches(12.333), Inches(0.5))
    tf = desc_box.text_frame
    p = tf.paragraphs[0]
    p.text = description
    p.font.size = Pt(16)
    p.font.color.rgb = GRAY
    
    # Image
    if os.path.exists(image_path):
        slide.shapes.add_picture(image_path, Inches(0.5), Inches(1.6), width=Inches(12.333))
    
    return slide

def add_features_slide(prs, title, features):
    """Add a features slide with bullet points"""
    slide_layout = prs.slide_layouts[6]  # Blank
    slide = prs.slides.add_slide(slide_layout)
    
    # Background
    background = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    background.fill.solid()
    background.fill.fore_color.rgb = DARK_BG
    background.line.fill.background()
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(12.333), Inches(1))
    tf = title_box.text_frame
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.CENTER
    
    # Features in two columns
    left_features = features[:len(features)//2]
    right_features = features[len(features)//2:]
    
    # Left column
    left_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(5.5), Inches(5))
    tf = left_box.text_frame
    for i, feature in enumerate(left_features):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = f"✓ {feature}"
        p.font.size = Pt(22)
        p.font.color.rgb = WHITE
        p.space_after = Pt(18)
    
    # Right column
    right_box = slide.shapes.add_textbox(Inches(7), Inches(1.8), Inches(5.5), Inches(5))
    tf = right_box.text_frame
    for i, feature in enumerate(right_features):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = f"✓ {feature}"
        p.font.size = Pt(22)
        p.font.color.rgb = WHITE
        p.space_after = Pt(18)
    
    return slide

# Create the presentation
# Slide 1: Title
add_title_slide(prs, "Educare", "AI-Powered Student Wellbeing Platform")

# Slide 2: Features Overview
features = [
    "Google OAuth Authentication",
    "Daily Mood Tracking (1-10 scale)",
    "AI-Powered Risk Analysis",
    "Hinge-Style Student Matching",
    "Comment on Likes Feature",
    "End-to-End Encrypted Chat",
    "Safeguarding Alerts System",
    "Super Admin Dashboard",
    "University Admin Dashboard",
    "Stripe Premium Subscriptions",
    "Data Export (CSV)",
    "Push Notifications"
]
add_features_slide(prs, "Core Features", features)

# Slide 3: Landing Page
add_content_slide(
    prs, 
    "Landing Page", 
    "Clean, modern landing page with Google Sign-In and university subscription link",
    "/tmp/ppt_01_landing.png"
)

# Slide 4: University Subscription
add_content_slide(
    prs, 
    "University Subscription", 
    "Universities can subscribe for £49.99/month to monitor their students' wellbeing",
    "/tmp/ppt_02_uni_subscribe.png"
)

# Slide 5: University Admin Login
add_content_slide(
    prs, 
    "University Admin Login", 
    "Dedicated secure login portal for university administrators",
    "/tmp/ppt_03_uni_login.png"
)

# Slide 6: University Dashboard
add_content_slide(
    prs, 
    "University Admin Dashboard", 
    "Real-time analytics: student count, mood trends, safeguarding alerts, and data export",
    "/tmp/ppt_04_dashboard_overview.png"
)

# Slide 7: Super Admin Dashboard
add_content_slide(
    prs, 
    "Super Admin Dashboard", 
    "Platform-wide analytics: all students, premium users, alerts, and AI insights",
    "/tmp/ppt_06_super_admin.png"
)

# Slide 8: Pricing
pricing_slide = prs.slide_layouts[6]
slide = prs.slides.add_slide(pricing_slide)

# Background
background = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
background.fill.solid()
background.fill.fore_color.rgb = DARK_BG
background.line.fill.background()

# Title
title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(12.333), Inches(1))
tf = title_box.text_frame
p = tf.paragraphs[0]
p.text = "Pricing Plans"
p.font.size = Pt(40)
p.font.bold = True
p.font.color.rgb = WHITE
p.alignment = PP_ALIGN.CENTER

# Student Plan
student_box = slide.shapes.add_textbox(Inches(1.5), Inches(2), Inches(4.5), Inches(4))
tf = student_box.text_frame
p = tf.paragraphs[0]
p.text = "Student Premium"
p.font.size = Pt(28)
p.font.bold = True
p.font.color.rgb = PURPLE

p = tf.add_paragraph()
p.text = "£4.99/month"
p.font.size = Pt(36)
p.font.bold = True
p.font.color.rgb = WHITE
p.space_before = Pt(12)

for feature in ["Unlimited matches", "Priority support", "Advanced insights", "No ads"]:
    p = tf.add_paragraph()
    p.text = f"• {feature}"
    p.font.size = Pt(18)
    p.font.color.rgb = GRAY
    p.space_before = Pt(8)

# University Plan
uni_box = slide.shapes.add_textbox(Inches(7.5), Inches(2), Inches(4.5), Inches(4))
tf = uni_box.text_frame
p = tf.paragraphs[0]
p.text = "University Dashboard"
p.font.size = Pt(28)
p.font.bold = True
p.font.color.rgb = PURPLE

p = tf.add_paragraph()
p.text = "£49.99/month"
p.font.size = Pt(36)
p.font.bold = True
p.font.color.rgb = WHITE
p.space_before = Pt(12)

for feature in ["Full dashboard access", "Student monitoring", "Safeguarding alerts", "Data export", "Priority support"]:
    p = tf.add_paragraph()
    p.text = f"• {feature}"
    p.font.size = Pt(18)
    p.font.color.rgb = GRAY
    p.space_before = Pt(8)

# Slide 9: Contact/End
add_title_slide(prs, "Thank You", "Contact: support@educare.com")

# Save
output_path = "/app/Educare_Presentation.pptx"
prs.save(output_path)
print(f"Presentation saved to: {output_path}")
