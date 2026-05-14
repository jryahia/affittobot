"""
Italian rental market reference data.
Prices are average monthly rent per m² in euros (2024 estimates).
Sources: Idealista, Immobiliare.it market reports.
"""

PRICE_DATA: dict[str, dict[str, float]] = {
    "roma": {
        "centro storico": 18.5,
        "prati": 16.0,
        "trastevere": 17.5,
        "parioli": 19.0,
        "testaccio": 15.0,
        "garbatella": 13.0,
        "eur": 12.5,
        "ostiense": 13.5,
        "nomentano": 14.0,
        "trieste": 15.5,
        "monti": 18.0,
        "default": 14.0,
    },
    "milano": {
        "centro": 23.0,
        "brera": 24.0,
        "porta venezia": 18.5,
        "navigli": 17.5,
        "isola": 19.5,
        "city life": 20.0,
        "porta romana": 17.0,
        "bovisa": 14.0,
        "lambrate": 15.0,
        "niguarda": 13.5,
        "default": 16.5,
    },
    "napoli": {
        "centro storico": 10.0,
        "chiaia": 14.0,
        "posillipo": 15.0,
        "vomero": 12.0,
        "fuorigrotta": 9.5,
        "bagnoli": 9.0,
        "secondigliano": 7.5,
        "default": 9.5,
    },
    "torino": {
        "centro": 12.5,
        "crocetta": 13.5,
        "san salvario": 12.0,
        "vanchiglia": 11.0,
        "aurora": 10.5,
        "mirafiori": 9.0,
        "barriera di milano": 8.5,
        "default": 10.5,
    },
    "firenze": {
        "centro storico": 17.0,
        "oltrarno": 16.0,
        "campo di marte": 13.5,
        "novoli": 12.0,
        "rifredi": 12.5,
        "gavinana": 12.0,
        "default": 13.0,
    },
    "bologna": {
        "centro storico": 15.0,
        "bolognina": 12.5,
        "san donato": 11.5,
        "navile": 11.0,
        "savena": 10.5,
        "porto saragozza": 14.0,
        "default": 12.0,
    },
    "palermo": {
        "centro storico": 7.5,
        "mondello": 9.0,
        "politeama": 8.0,
        "zisa": 6.5,
        "palagonia": 6.0,
        "default": 7.0,
    },
    "genova": {
        "centro storico": 9.0,
        "albaro": 12.0,
        "foce": 10.5,
        "oregina": 8.0,
        "sampierdarena": 8.5,
        "sestri ponente": 7.5,
        "default": 9.0,
    },
    "venezia": {
        "centro storico": 20.0,
        "mestre": 10.0,
        "marghera": 9.0,
        "cannaregio": 19.0,
        "dorsoduro": 21.0,
        "san polo": 20.5,
        "default": 14.0,
    },
    "verona": {
        "centro": 12.0,
        "borgo trento": 11.5,
        "borgo venezia": 10.0,
        "golosine": 10.5,
        "quinzano": 9.0,
        "default": 10.5,
    },
    "bari": {
        "centro": 10.0,
        "murat": 10.5,
        "poggiofranco": 9.5,
        "japigia": 8.5,
        "carbonara": 8.0,
        "default": 9.0,
    },
    "catania": {
        "centro": 8.5,
        "borgo": 9.0,
        "ognina": 9.5,
        "cibali": 7.5,
        "default": 8.0,
    },
}

NATIONAL_AVERAGE_PER_M2: float = 12.0


def get_market_data(city: str, neighborhood: str, size_m2: int, price: int) -> dict:
    """Compare user's rent against local market averages."""
    city_key = city.lower().strip()
    neighborhood_key = neighborhood.lower().strip()

    city_data = PRICE_DATA.get(city_key)
    if city_data:
        avg_price_m2 = city_data.get(neighborhood_key, city_data["default"])
        data_source = "dati zona"
    else:
        avg_price_m2 = NATIONAL_AVERAGE_PER_M2
        data_source = "media nazionale"

    media_zona = int(avg_price_m2 * size_m2)
    differenza = price - media_zona
    differenza_percentuale = round((differenza / media_zona) * 100) if media_zona > 0 else 0

    if differenza_percentuale > 15:
        confronto = "sopra media"
    elif differenza_percentuale < -15:
        confronto = "sotto media"
    else:
        confronto = "nella media"

    return {
        "media_zona": media_zona,
        "prezzo_utente": price,
        "differenza": differenza,
        "differenza_percentuale": differenza_percentuale,
        "confronto": confronto,
        "avg_price_m2": avg_price_m2,
        "city": city,
        "neighborhood": neighborhood,
        "size_m2": size_m2,
        "data_source": data_source,
    }
