import requests

def first_request(search_parameters):
    url = "https://api.leboncoin.fr/finder/search"
    headers = {
        "api_key": "ba0c2dad52b3ec",
        "content-type": "application/json",
        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Referer": "https://www.leboncoin.fr/recherche?category=9&locations=Pau_64000__43.2965_-0.37432_5000&square=30-max&price=min-80001",
        "Referrer-Policy": "no-referrer-when-downgrade"
    }

    payload = {
        "filters": {
            "category": {
                "id": "9"
            },
            "enums": {
                "ad_type": ["offer"]
            },
            "location": {
                "locations": [{
                    "locationType": "city",
                    "city": "Pau",
                    "zipcode": "64000",
                    "label": "Pau (64000)",
                    "region_id": "2",
                    "department_id": "64",
                    "area": {
                        "lat": 43.2965,
                        "lng": -0.37432,
                        "default_radius": 5000
                    }
                }]
            },
            "ranges": {
                "square": {
                    "min": 30
                },
                "price": {
                    "max": 80000
                }
            }
        },
        "limit": 0,
        "limit_alu": 0,
        "sort_by": "time",
        "sort_order": "desc"
    }

    response = requests.post(url, headers=headers, json=payload)

    print(response.json())


search_parameters = []

first_request(search_parameters)

