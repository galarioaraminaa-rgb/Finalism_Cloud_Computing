"""
Run: python seed.py
Seeds the database with beauty & makeup products.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine
from app.models.base import Base, User, Category, Product
from app.core.security import get_password_hash
from decimal import Decimal

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── Admin user ─────────────────────────────────────────────────────────────────
if not db.query(User).filter(User.email == "admin@glamora.com").first():
    admin = User(
        email="admin@glamora.com",
        username="admin",
        full_name="Glamora Admin",
        hashed_password=get_password_hash("admin123"),
        is_admin=True,
    )
    db.add(admin)

# ── Test user ─────────────────────────────────────────────────────────────────
if not db.query(User).filter(User.email == "user@glamora.com").first():
    user = User(
        email="user@glamora.com",
        username="beautyqueen",
        full_name="Beauty Queen",
        hashed_password=get_password_hash("user123"),
    )
    db.add(user)
db.commit()

# ── Categories ────────────────────────────────────────────────────────────────
cats_data = [
    ("Lipstick & Lip Color", "lipstick", "Stunning lip colors from nudes to bold reds",
     "https://images.unsplash.com/photo-1586495777744-4e6232bf3736?w=400"),
    ("Foundation & Concealer", "foundation", "Flawless base for every skin tone",
     "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400"),
    ("Eyeshadow & Eye Makeup", "eyeshadow", "Create mesmerizing eye looks",
     "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400"),
    ("Skincare", "skincare", "Nourish and protect your skin",
     "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400"),
    ("Blush & Bronzer", "blush-bronzer", "Sculpt and add warmth to your complexion",
     "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=400"),
    ("Mascara & Lashes", "mascara", "Dramatic lashes for every look",
     "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=400"),
    ("Fragrance", "fragrance", "Signature scents for every mood",
     "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400"),
    ("Brushes & Tools", "brushes-tools", "Professional-grade makeup tools",
     "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400"),
]

cat_map = {}
for name, slug, desc, img in cats_data:
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        cat = Category(name=name, slug=slug, description=desc, image_url=img)
        db.add(cat)
        db.flush()
    cat_map[slug] = cat.id
db.commit()

# ── Products ─────────────────────────────────────────────────────────────────
products_data = [
    # Lipstick
    ("Ruby Kiss Matte Lipstick", "ruby-kiss-matte", "lipstick",
     "Intensely pigmented matte formula that lasts all day. Deeply conditioning with vitamin E.",
     Decimal("549"), Decimal("699"), "MAC", True,
     "https://images.unsplash.com/photo-1586495777744-4e6232bf3736?w=600"),
    ("Nude Glow Lip Gloss", "nude-glow-gloss", "lipstick",
     "High-shine gloss that plumps and hydrates for a full, luscious pout.",
     Decimal("299"), Decimal("399"), "NYX", True,
     "https://images.unsplash.com/photo-1631214503851-25e39b13a735?w=600"),
    ("Berry Bliss Lip Liner", "berry-bliss-liner", "lipstick",
     "Long-lasting formula with a creamy texture for defined lips all day.",
     Decimal("199"), None, "Charlotte Tilbury", False,
     "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"),
    ("Satin Rose Lipstick", "satin-rose-lipstick", "lipstick",
     "Creamy satin finish with a buildable color payoff. Moisturizing and comfortable to wear.",
     Decimal("449"), Decimal("599"), "NARS", True,
     "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"),

    # Foundation
    ("Flawless Finish Foundation", "flawless-finish-foundation", "foundation",
     "Buildable coverage with a natural finish. 30+ shades for every skin tone. SPF 15.",
     Decimal("1299"), Decimal("1599"), "Fenty Beauty", True,
     "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600"),
    ("Poreless Perfection Concealer", "poreless-concealer", "foundation",
     "Full-coverage concealer that blurs pores and dark circles. 24-hour wear.",
     Decimal("699"), Decimal("899"), "NARS", True,
     "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600"),
    ("Luminous Skin Tint", "luminous-skin-tint", "foundation",
     "Sheer, buildable tint with a luminous finish. Ideal for everyday wear.",
     Decimal("899"), None, "Laura Mercier", False,
     "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600"),

    # Eyeshadow
    ("Desert Dusk Palette", "desert-dusk-palette", "eyeshadow",
     "18 stunning neutral-warm shades ranging from matte to glitter. Highly pigmented.",
     Decimal("1599"), Decimal("1999"), "Huda Beauty", True,
     "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"),
    ("Midnight Smoke Palette", "midnight-smoke-palette", "eyeshadow",
     "Dramatic smoky eye palette with 12 rich shades. Professional formula.",
     Decimal("1299"), Decimal("1599"), "Urban Decay", True,
     "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"),
    ("Rose Gold Shimmer", "rose-gold-shimmer", "eyeshadow",
     "Single pressed highlighter shadow in gorgeous rose gold shimmer.",
     Decimal("349"), None, "ColourPop", False,
     "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"),

    # Skincare
    ("Glow Serum Vitamin C", "vitamin-c-glow-serum", "skincare",
     "20% Vitamin C serum that brightens, firms, and reduces dark spots. Dermatologist tested.",
     Decimal("1899"), Decimal("2499"), "Drunk Elephant", True,
     "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600"),
    ("Hydra Boost Moisturizer", "hydra-boost-moisturizer", "skincare",
     "Lightweight gel-cream that provides 48-hour hydration. Hyaluronic acid formula.",
     Decimal("1299"), Decimal("1599"), "Neutrogena", True,
     "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600"),
    ("Retinol Night Cream", "retinol-night-cream", "skincare",
     "Clinically proven retinol formula that reduces fine lines and wrinkles overnight.",
     Decimal("1599"), None, "RoC", False,
     "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600"),
    ("SPF 50 Sunscreen", "spf-50-sunscreen", "skincare",
     "Lightweight, non-greasy mineral sunscreen. No white cast, suitable for all skin types.",
     Decimal("799"), Decimal("999"), "EltaMD", True,
     "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600"),

    # Blush
    ("Peach Frenzy Blush", "peach-frenzy-blush", "blush-bronzer",
     "Silky-smooth blush in a gorgeous peachy coral. Buildable and long-lasting.",
     Decimal("699"), Decimal("899"), "NARS", True,
     "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=600"),
    ("Sun-Kissed Bronzer", "sun-kissed-bronzer", "blush-bronzer",
     "Finely milled bronzer that gives a natural sun-kissed glow. Matte finish.",
     Decimal("849"), None, "Too Faced", False,
     "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=600"),

    # Mascara
    ("Lash Paradise Mascara", "lash-paradise-mascara", "mascara",
     "Voluminizing and lengthening formula. Soft wavy brush adds intense volume.",
     Decimal("549"), Decimal("699"), "L'Oreal", True,
     "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=600"),
    ("Tubing Mascara Pro", "tubing-mascara-pro", "mascara",
     "Innovative tubing formula that slides off easily with warm water. No panda eyes.",
     Decimal("699"), None, "Kevyn Aucoin", False,
     "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=600"),

    # Fragrance
    ("Bloom Floral Eau de Parfum", "bloom-floral-edp", "fragrance",
     "A romantic floral bouquet of rose, peony, and musk. 50ml.",
     Decimal("2999"), Decimal("3499"), "Gucci", True,
     "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600"),
    ("Amber Oud Intense", "amber-oud-intense", "fragrance",
     "Rich oriental fragrance with notes of oud, amber, and vanilla. 100ml.",
     Decimal("3499"), None, "Maison Margiela", True,
     "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600"),

    # Brushes
    ("Pro Contour Brush Set", "pro-contour-brush-set", "brushes-tools",
     "8-piece professional contour and highlight brush set with synthetic bristles.",
     Decimal("1199"), Decimal("1499"), "Real Techniques", True,
     "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600"),
    ("Foundation Blender Sponge", "foundation-blender-sponge", "brushes-tools",
     "Tear-drop shaped beauty sponge for seamless foundation blending.",
     Decimal("399"), None, "BeautyBlender", False,
     "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600"),
]

for name, slug, cat_slug, desc, price, compare, brand, featured, img in products_data:
    if not db.query(Product).filter(Product.slug == slug).first():
        p = Product(
            name=name, slug=slug,
            category_id=cat_map[cat_slug],
            description=desc,
            price=price,
            compare_price=compare,
            brand=brand,
            is_featured=featured,
            image_url=img,
            stock=50,
            sku=slug.upper()[:20],
            rating_avg=round(3.5 + __import__('random').random() * 1.5, 1),
            rating_count=__import__('random').randint(10, 200),
        )
        db.add(p)

db.commit()
print("✅ Database seeded successfully!")
print("   Admin: admin@glamora.com / admin123")
print("   User:  user@glamora.com  / user123")
db.close()
