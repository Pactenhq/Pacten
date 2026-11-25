#!/usr/bin/env python3
"""Generate the standardized filter datasets for Pacten.

Single source of truth: api/src/datasets/*.ts (TypeScript modules, not
JSON — the api tsconfig has no resolveJsonModule and NestJS does not copy
loose JSON into dist, so .ts modules are the only importable form there).
The web app never duplicates this data; it fetches it from the api
(GET /profiles/datasets and the filter-options endpoints).

Provenance:
  - Countries: pycountry (ISO 3166, alpha-2 codes) — 249 entries.
  - Cities: geonamescache (GeoNames), population >= CITY_MIN_POPULATION,
    grouped by ISO alpha-2 country code, names de-duplicated and sorted.
    Threshold 50,000 keeps the file usable (~12k cities) while covering
    every city a creator/professional would realistically pick.
  - Languages: pycountry (ISO 639, entries with an ISO 639-1 alpha-2
    code) — 184 entries. No invented languages.
  - Skills / Industries: hand-curated lists below (real, reviewable).
    They deliberately include every real value already stored on staging
    profiles (Figma, Gaming, Photography, Streaming, Video, Video
    Editing; Fashion, Beauty, Fitness, Gaming, Travel, Food, Business,
    Lifestyle, Technology) and deliberately EXCLUDE the fictional /
    out-of-taxonomy values found on staging (ZorkianSkill, ZorkianCraft,
    Elvish, Zorkian, Astrophysics, Marine Biology).

Usage:
  pip install pycountry geonamescache
  python3 scripts/generate-filter-datasets.py
  # Re-generating must produce byte-identical output for unchanged inputs.
"""

import json
import os
import sys

CITY_MIN_POPULATION = 50_000

SKILLS = [
    "Video Editing",
    "Videography",
    "Video",
    "Photography",
    "Photo Editing",
    "Portrait Photography",
    "Product Photography",
    "Drone Photography",
    "Streaming",
    "Live Streaming",
    "Livestream Production",
    "Podcasting",
    "Voiceover",
    "Audio Editing",
    "Music Production",
    "Content Creation",
    "UGC Creation",
    "Short-form Video",
    "Long-form Video",
    "Scriptwriting",
    "Copywriting",
    "Blogging",
    "Storytelling",
    "Thumbnail Design",
    "Graphic Design",
    "Illustration",
    "UI Design",
    "UX Design",
    "Web Design",
    "Motion Graphics",
    "Animation",
    "3D Modelling",
    "Figma",
    "Interior Design",
    "Social Media Management",
    "Social Media Marketing",
    "Influencer Marketing",
    "Brand Partnerships",
    "Community Management",
    "Email Marketing",
    "Affiliate Marketing",
    "Paid Advertising",
    "SEO",
    "Analytics",
    "Public Relations",
    "Journalism",
    "Marketing Strategy",
    "Gaming",
    "Acting",
    "Modelling",
    "Dance",
    "Comedy",
    "Public Speaking",
    "Teaching",
    "Tutoring",
    "Language Teaching",
    "Translation",
    "Proofreading",
    "Editing",
    "Research",
    "Writing",
    "Web Development",
    "Mobile App Development",
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Python",
    "AI & Machine Learning",
    "AR/VR Development",
    "Cybersecurity",
    "Cloud Computing",
    "Data Analysis",
    "Product Management",
    "Project Management",
    "Business Strategy",
    "Sales",
    "Customer Service",
    "Virtual Assistance",
    "Accounting",
    "Bookkeeping",
    "Financial Planning",
    "E-commerce",
    "Dropshipping",
    "Event Planning",
    "Fitness Coaching",
    "Nutrition",
    "Yoga",
    "Makeup Artistry",
    "Hair Styling",
    "Fashion Styling",
    "Cooking",
    "Baking",
    "Travel Planning",
    "Real Estate Marketing",
    "Personal Branding",
]

INDUSTRIES = [
    "Fashion",
    "Beauty",
    "Fitness",
    "Gaming",
    "Travel",
    "Food",
    "Business",
    "Lifestyle",
    "Technology",
    "Health & Wellness",
    "Education",
    "Music",
    "Sports",
    "Finance",
    "Real Estate",
    "Automotive",
    "Entertainment",
    "E-commerce",
    "Hospitality",
    "Retail",
    "Media & Publishing",
    "Marketing & Advertising",
    "Art & Design",
    "Film & Video",
    "Podcasting",
    "Parenting & Family",
    "Home & Living",
    "Pets",
    "Environment & Sustainability",
    "Nonprofit",
    "Luxury",
    "News & Politics",
    "Science",
    "Dating & Relationships",
    "Parenting",
    "Outdoors",
]

# "Parenting & Family" and "Parenting" overlap; keep the taxonomy clean.
INDUSTRIES = [i for i in INDUSTRIES if i != "Parenting"]


def ts_string_list(name, values):
    body = ",\n".join("  " + json.dumps(v, ensure_ascii=False) for v in values)
    return f"export const {name}: string[] = [\n{body},\n];\n"


def main():
    try:
        import pycountry
        import geonamescache
    except ImportError as e:
        print(f"Missing dependency: {e}. Run: pip install pycountry geonamescache")
        return 1

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(root, "api", "src", "datasets")
    os.makedirs(out_dir, exist_ok=True)

    assert 60 <= len(SKILLS) <= 100, f"skills count {len(SKILLS)} outside 60-100"
    assert 25 <= len(INDUSTRIES) <= 40, f"industries count {len(INDUSTRIES)} outside 25-40"
    assert len(SKILLS) == len(set(SKILLS)), "duplicate skill"
    assert len(INDUSTRIES) == len(set(INDUSTRIES)), "duplicate industry"
    banned = {"ZorkianSkill", "ZorkianCraft", "Elvish", "Zorkian",
              "Astrophysics", "Marine Biology"}
    assert not (set(SKILLS) | set(INDUSTRIES)) & banned, "banned value in curated lists"
    for required in ("Figma", "Gaming", "Photography", "Streaming", "Video", "Video Editing"):
        assert required in SKILLS, f"missing required skill {required}"
    for required in ("Fashion", "Beauty", "Fitness", "Gaming", "Travel", "Food",
                     "Business", "Lifestyle", "Technology"):
        assert required in INDUSTRIES, f"missing required industry {required}"

    countries = sorted(
        ({"code": c.alpha_2, "name": c.name} for c in pycountry.countries),
        key=lambda c: c["name"],
    )
    assert len(countries) == 249, f"expected 249 countries, got {len(countries)}"

    languages = sorted(
        ({"code": lang.alpha_2, "name": lang.name} for lang in pycountry.languages
         if hasattr(lang, "alpha_2")),
        key=lambda l: l["name"],
    )
    assert 150 <= len(languages) <= 200, f"languages count {len(languages)}"

    gc = geonamescache.GeonamesCache()
    by_country = {}
    for city in gc.get_cities().values():
        pop = city.get("population") or 0
        if pop < CITY_MIN_POPULATION:
            continue
        code = city["countrycode"]
        name = city["name"].strip()
        if not name:
            continue
        by_country.setdefault(code, set()).add(name)
    cities_by_country = {
        code: sorted(names) for code, names in sorted(by_country.items())
    }
    total_cities = sum(len(v) for v in cities_by_country.values())
    print(f"countries={len(countries)} languages={len(languages)} "
          f"cities={total_cities} in {len(cities_by_country)} countries "
          f"(pop >= {CITY_MIN_POPULATION:,}) skills={len(SKILLS)} "
          f"industries={len(INDUSTRIES)}")

    header = (
        "// GENERATED by scripts/generate-filter-datasets.py — do not edit by hand.\n"
        "// Re-run the script to regenerate (pycountry + geonamescache).\n\n"
    )

    with open(os.path.join(out_dir, "countries.ts"), "w", encoding="utf-8") as f:
        f.write(header)
        f.write("export interface DatasetCountry { code: string; name: string; }\n\n")
        f.write("export const COUNTRIES: DatasetCountry[] = ")
        f.write(json.dumps(countries, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        f.write("export const COUNTRY_NAMES: string[] = COUNTRIES.map((c) => c.name);\n")

    with open(os.path.join(out_dir, "cities.ts"), "w", encoding="utf-8") as f:
        f.write(header)
        f.write("// Cities with population >= 50,000 (GeoNames), keyed by ISO 3166 alpha-2\n"
                "// country code. Names de-duplicated and sorted per country.\n")
        f.write("export const CITIES_BY_COUNTRY: Record<string, string[]> = ")
        f.write(json.dumps(cities_by_country, ensure_ascii=False, indent=2))
        f.write(";\n")

    with open(os.path.join(out_dir, "languages.ts"), "w", encoding="utf-8") as f:
        f.write(header)
        f.write("export interface DatasetLanguage { code: string; name: string; }\n\n")
        f.write("export const LANGUAGES: DatasetLanguage[] = ")
        f.write(json.dumps(languages, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        f.write("export const LANGUAGE_NAMES: string[] = LANGUAGES.map((l) => l.name);\n")

    with open(os.path.join(out_dir, "skills.ts"), "w", encoding="utf-8") as f:
        f.write(header)
        f.write("// Hand-curated in scripts/generate-filter-datasets.py.\n")
        f.write(ts_string_list("SKILLS", sorted(SKILLS)))

    with open(os.path.join(out_dir, "industries.ts"), "w", encoding="utf-8") as f:
        f.write(header)
        f.write("// Hand-curated in scripts/generate-filter-datasets.py.\n")
        f.write(ts_string_list("INDUSTRIES", sorted(INDUSTRIES)))

    return 0


if __name__ == "__main__":
    sys.exit(main())
