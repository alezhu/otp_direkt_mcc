// ==UserScript==
// @name         OTP MCC Codes
// @namespace    http://tampermonkey.net/
// @version      0.31
// @description  Show MCC in OTP Direct
// @author       alezhu
// @match        https://direkt.otpbank.ru/homebank/do/bankkartya/szamlatortenet*
// @match        https://direkt.otpbank.ru/homebank/do/bankkartya/kartyaTranzakcioReszletek*
// @grant        GM_addStyle
// @source      https://raw.githubusercontent.com/alezhu/otp_direkt_mcc/master/otp_direct_mcc.user.js
// @updateURL   https://raw.githubusercontent.com/alezhu/otp_direkt_mcc/master/otp_direct_mcc.user.js
// @downloadURL https://raw.githubusercontent.com/alezhu/otp_direkt_mcc/master/otp_direct_mcc.user.js
// ==/UserScript==


GM_addStyle(`
td.numerikus > span.cb0 {
color:red;
}

td.numerikus > span.cb1 {
color:black;
}

td.numerikus > span.cb7 {
color:blue;
}
`);

(function ($) {
    'use strict';
    var LOG = 1;
    var PREFIX = "AZ";

    var MCCFix = {
        "4900": {
            "date": function (oDate) {
                if (oDate < new Date(2019, 6, 1)) {
                    return 7;
                }
                return 1;
            }
        }
    };

    var CardTypes = {
        no_cb: {
            exclude: true,
            category: {
                "Telecommunications Equipment including telephone sales": "4812",
                "Telecommunication equipment including telephone sales": "4812",
                "Telecommunication srvice including local and long distance calls, credit card calls, calls through use of magnetic stripe reading telephones, fax serv": "4814",
                "Key-entry Telecom Merchant providing single local and long-distance phone calls using a central access number in a non-face-to-face environment using key entry": "4813",
                "Fax services, Telecommunication Services": "4814",
                "Computer Network Services": "4816",
                "Money Orders – Wire Transfer": "4829",
                "Pawn Shops and Salvage Yards": "5933",
                "Financial Institutions – Automated cash disbursements": "6011",
                "Financial Institutions – Manual Cash Disbursements": [
                    "6010",
                    "6011"
                ],
                "Financial Institutions – Merchandise and Services": "6012",
                "Quasi Cash - Member Financial Institution": "6050",
                "Non-Financial Institutions – Foreign Currency, Money Orders (not wire transfer) and Travelers Cheques": "6051",
                "Quasi Cash-Merchant": "6051",
                "Security Brokers/Dealers": "6211",
                "Insurance Sales, Underwriting, and Premiums": "6300",
                "Payment Transaction - Member": "6532",
                "Payment Transaction - Merchant": "6533",
                "MONEYSEND INTRACOUNTRY": [
                    "6536",
                    "6537"
                ],
                "Moneysend-Funding": "6538",
                "POI FUNDING TRANSACTIONS": "6540",
                "Miscellaneous Personal Services ( not elsewhere classifies)": "7299",
                "Advertising Services": "7311",
                "Consumer Credit Reporting Agencies": "7321",
                "Computer Programming, Integrated Systems Design and Data Processing Services": "7372",
                "Business Services, Not Elsewhere Classified": "7399",
                "Betting (including Lottery Tickets, Casino Gaming Chips, Off-track Betting and Wagers at Race Tracks)": "7995",
                "Charitable and Social Service Organizations": "8398",
                "Political Organizations": "8651",
                "Professional Services ( Not Elsewhere Defined)": "8999",
                "Professional services, not elsewhere classified": "8999",
                "Fines": "9222",
                "Bail and Bond Payments": "9223",
                "Tax Payments": "9311",
                "Government Services ( Not Elsewhere Classified)": "9399"
            },
        },
        family: {
            pattern: /семейная/i,
            category: {
                "Ambulance Services": "4119",
                "Electric, Gas, Sanitary and Water Utilities": "4900",
                "Utilities - electric, gas, water, sanitary": "4900",
                "Drugs, Drug Proprietors, and Druggist’s Sundries": "5122",
                "Drugs/Drug propriat/Sundries": "5122",
                "Grocery Stores, Supermarkets": "5411",
                "Misc. Food Stores – Convenience Stores and Specialty Markets": "5499",
                "Miscallenous food stores-specialty markets, convenience": "5499",
                "Children’s and Infant’s Wear Stores": "5641",
                "Children's and infant's wear stores": "5641",
                "Drug Stores and Pharmacies": "5912",
                "Drug stores, pharmacies": "5912",
                "Hobby, Toy, and Game Shops": "5945",
                "Hobby, toy and game stores": "5945",
                "Hearing Aids – Sales, Service, and Supply Stores": "5975",
                "Orthopedic Goods Prosthetic Devices": "5976",
                "Doctors and Physicians (Not Elsewhere Classified)": "8011",
                "Doctors": "8011",
                "Dentists and Orthodontists": "8021",
                "Dentists, orthodontists": "8021",
                "Osteopaths": "8031",
                "Chiropractors": "8041",
                "Optometrists and Ophthalmologists": "8042",
                "Optometrists, ophthalmologists": "8042",
                "Opticians, Opticians Goods and Eyeglasses": "8043",
                "Opticians": "8043",
                "Opticians, Optical Goods, and Eyeglasses (no longer validfor first presentments)": "8044",
                "Podiatrists and Chiropodists": "8049",
                "Nursing and Personal Care Facilities": "8050",
                "Hospitals": "8062",
                "Medical and Dental Laboratories": "8071",
                "Medical Services and Health Practitioners (Not Elsewhere Classified)": "8099",
                "Medical services, health practitioners, not elsewhere classified": "8099",
                "Child Care Services": "8351"
            },
        },
        home: {
            pattern: /ремонт/i,
            category: {
                "Horticultural Services, Landscaping Services": "0780",
                "General Contractors-Residential and Commercial": "1520",
                "Air Conditioning Contractors – Sales and Installation, Heating Contractors – Sales, Service, Installation": "1711",
                "Electrical Contractors": "1731",
                "Insulation – Contractors, Masonry, Stonework Contractors, Plastering Contractors, Stonework and Masonry Contractors, Tile Settings Contractors": "1740",
                "Carpentry Contractors": "1750",
                "Roofing – Contractors, Sheet Metal Work – Contractors, Siding – Contractors": "1761",
                "Contractors – Concrete Work": "1771",
                "Contractors – Special Trade, Not Elsewhere Classified": "1799",
                "Typesetting, Plate Making, & Related Services": "2791",
                "Specialty Cleaning, Polishing, and Sanitation Preparations": "2842",
                "Office and Commercial Furniture": "5021",
                "Construction Materials, Not Elsewhere Classified": "5039",
                "Computers, Computer Peripheral Equipment, Software": "5045",
                "Commercial Equipment, Not Elsewhere Classified": "5046",
                "Metal Service Centers and Offices": "5051",
                "Electrical Parts and Equipment": "5065",
                "Hardware Equipment and Supplies": "5072",
                "Plumbing and Heating Equipment and Supplies": "5074",
                "Industrial Supplies, Not Elsewhere Classified": "5085",
                "Paints, Varnishes, and Supplies": "5198",
                "Home Supply Warehouse Stores": "5200",
                "Home Supply, Warehouse": "5200",
                "Lumber and Building Materials Stores": "5211",
                "Lumber, building materials stores": "5211",
                "Glass, Paint, and Wallpaper Stores": "5231",
                "Hardware Stores": "5251",
                "Nurseries – Lawn and Garden Supply Store": "5261",
                "Nurseries, lawn, garden supply stores": "5261",
                "Department stores": "5311",
                "Furniture, Home Furnishings, and Equipment Stores, ExceptAppliances": "5712",
                "Furniture, home furnishings and and equipment stores, except appliances": "5712",
                "Floor Covering Stores": "5713",
                "Drapery, Window Covering and Upholstery Stores": "5714",
                "Fireplace, Fireplace Screens, and Accessories Stores": "5718",
                "Miscellaneous Home Furnishing Specialty Stores": "5719",
                "Household Appliance Stores": "5722",
                "Electronic Sales": "5732",
                "Radio, television and stereo stores": "5732",
                "Music Stores, Musical Instruments, Piano Sheet Music": "5733",
                "Record Shops": "5735",
                "Camera and Photographic Supply Stores": "5946",
                "Computer Maintenance and Repair Services, Not Elsewhere Classified": "7379",
                "Radio Repair Shops": "7622",
                "Air Conditioning and Refrigeration Repair Shops": "7623",
                "Electrical And Small Appliance Repair Shops": "7629",
                "Furniture, Furniture Repair, and Furniture Refinishing": "7641",
                "Welding Repair": "7692",
                "Repair Shops and Related Services –Miscellaneous": "7699"
            },
        },
        auto: {
            pattern: /авто/i,
            category: {
                "Motor vehicle supplies and new parts": "5013",
                "Petroleum and Petroleum Products": "5172",
                "Car and Truck Dealers (New and Used) Sales, Service, Repairs, Parts, and Leasing": "5511",
                "Automobile and Truck Dealers (Used Only)": "5521",
                "Automobile Supply Stores": "5531",
                "Automotive Tire Stores": "5532",
                "Automotive Parts, Accessories Stores": "5533",
                "Service Stations ( with or without ancillary services)": "5541",
                "Automated Fuel Dispensers": "5542",
                "Recreational and Utility Trailers, Camp Dealers": "5561",
                "Motorcycle Dealers": "5571",
                "Motor Home Dealers": "5592",
                "Snowmobile Dealers": "5598",
                "Miscellaneous Auto Dealers ": "5599",
                "Fuel – Fuel Oil, Wood, Coal, Liquefied Petroleum": "5983",
                "Automobile Parking Lots and Garages": "7523",
                "Automotive Body Repair Shops": "7531",
                "Tire Re-treading and Repair Shops": "7534",
                "Paint Shops – Automotive": "7535",
                "Automotive Service Shops": "7538",
                "Car Washes": "7542",
                "Towing Services": "7549",
                "Automobile Associations": "8675"
            },
        },
        travel: {
            pattern: /путешествия/i,
            category: {
                "UNITED AIRLINES": "3000",
                "AMERICAN AIRLINES": "3001",
                "PAN AMERICAN": "3002",
                "Airlines": [
                    "3003",
                    "3019",
                    "3026",
                    "3059",
                    "3064",
                    "3067",
                    "3068",
                    "3072",
                    "3079",
                    "3086",
                    "3090",
                    "3092",
                    "3095",
                    "3097",
                    "3098",
                    "3115",
                    "3131",
                    "3132",
                    "3136",
                    "3148",
                    "3156",
                    "3167",
                    "3174",
                    "3175",
                    "3177",
                    "3180",
                    "3183",
                    "3188",
                    "3206",
                    "3211",
                    "3213",
                    "3226",
                    "3236",
                    "3245",
                    "3246",
                    "3247",
                    "3248",
                    "3260",
                    "3263",
                    "3296",
                    "3297"
                ],
                "TRANS WORLD AIRLINES": "3004",
                "BRITISH AIRWAYS": "3005",
                "JAPAN AIRLINES": "3006",
                "AIR FRANCE": "3007",
                "LUFTHANSA": "3008",
                "AIR CANADA": "3009",
                "KLM (ROYAL DUTCH AIRLINES)": "3010",
                "AEORFLOT": "3011",
                "QUANTAS": "3012",
                "ALITALIA": "3013",
                "SAUDIA ARABIAN AIRLINES": "3014",
                "SWISSAIR": "3015",
                "SAS": "3016",
                "SOUTH AFRICAN AIRWAYS": "3017",
                "VARIG (BRAZIL)": "3018",
                "AIR-INDIA": "3020",
                "AIR ALGERIE": "3021",
                "PHILIPPINE AIRLINES": "3022",
                "MEXICANA": "3023",
                "PAKISTAN INTERNATIONAL": "3024",
                "AIR NEW ZEALAND": "3025",
                "UTA/INTERAIR": "3027",
                "AIR MALTA": "3028",
                "SABENA": "3029",
                "AEROLINEAS ARGENTINAS": "3030",
                "OLYMPIC AIRWAYS": "3031",
                "EL AL": "3032",
                "ANSETT AIRLINES": "3033",
                "AUSTRAINLIAN AIRLINES": "3034",
                "TAP (PORTUGAL)": "3035",
                "VASP (BRAZIL)": "3036",
                "EGYPTAIR": "3037",
                "KUWAIT AIRLINES": "3038",
                "AVIANCA": "3039",
                "GULF AIR (BAHRAIN)": "3040",
                "BALKAN-BULGARIAN AIRLINES": "3041",
                "FINNAIR": "3042",
                "AER LINGUS": "3043",
                "AIR LANKA": "3044",
                "NIGERIA AIRWAYS": "3045",
                "CRUZEIRO DO SUL (BRAZIJ)": "3046",
                "THY (TURKEY)": "3047",
                "ROYAL AIR MAROC": "3048",
                "TUNIS AIR": "3049",
                "ICELANDAIR": "3050",
                "AUSTRIAN AIRLINES": "3051",
                "LANCHILE": "3052",
                "AVIACO (SPAIN)": "3053",
                "LADECO (CHILE)": "3054",
                "LAB (BOLIVIA)": "3055",
                "QUEBECAIRE": "3056",
                "EASTWEST AIRLINES (AUSTRALIA)": "3057",
                "DELTA": "3058",
                "NORTHWEST": "3060",
                "CONTINENTAL": "3061",
                "WESTERN": "3062",
                "US AIR": "3063",
                "AIRINTER": "3065",
                "SOUTHWEST": "3066",
                "SUN COUNTRY AIRLINES": "3069",
                "AIR BRITISH COLUBIA": "3071",
                "SINGAPORE AIRLINES": "3075",
                "AEROMEXICO": "3076",
                "THAI AIRWAYS": "3077",
                "CHINA AIRLINES": "3078",
                "NORDAIR": "3081",
                "KOREAN AIRLINES": "3082",
                "AIR AFRIGUE": "3083",
                "EVA AIRLINES": "3084",
                "MIDWEST EXPRESS AIRLINES, INC.": "3085",
                "METRO AIRLINES": "3087",
                "CROATIA AIRLINES": "3088",
                "TRANSAERO": "3089",
                "ZAMBIA AIRWAYS": "3094",
                "AIR ZIMBABWE": "3096",
                "CATHAY PACIFIC": "3099",
                "MALAYSIAN AIRLINE SYSTEM": "3100",
                "IBERIA": "3102",
                "GARUDA (INDONESIA)": "3103",
                "BRAATHENS S.A.F.E. (NORWAY)": "3106",
                "WINGS AIRWAYS": "3110",
                "BRITISH MIDLAND": "3111",
                "WINDWARD ISLAND": "3112",
                "VIASA": "3117",
                "VALLEY AIRLINES": "3118",
                "TAN": "3125",
                "TALAIR": "3126",
                "TACA INTERNATIONAL": "3127",
                "SURINAM AIRWAYS": "3129",
                "SUN WORLD INTERNATIONAL": "3130",
                "SUNBELT AIRLINES": "3133",
                "SUDAN AIRWAYS": "3135",
                "SINGLETON": "3137",
                "SIMMONS AIRLINES": "3138",
                "SCENIC AIRLINES": "3143",
                "VIRGIN ATLANTIC": "3144",
                "SAN JUAN AIRLINES": "3145",
                "LUXAIR": "3146",
                "AIR ZAIRE": "3151",
                "PRINCEVILLE": "3154",
                "PBA": "3159",
                "ALL NIPPON AIRWAYS": "3161",
                "NORONTAIR": "3164",
                "NEW YORK HELICOPTER": "3165",
                "NOUNT COOK": "3170",
                "CANADIAN AIRLINES INTERNATIONAL": "3171",
                "NATIONAIR": "3172",
                "METROFLIGHT AIRLINES": "3176",
                "MESA AIR": "3178",
                "MALEV": "3181",
                "LOT (POLAND)": "3182",
                "LIAT": "3184",
                "LAV (VENEZUELA)": "3185",
                "LAP (PARAGUAY)": "3186",
                "LACSA (COSTA RICA)": "3187",
                "JUGOSLAV AIR": "3190",
                "ISLAND AIRLINES": "3191",
                "IRAN AIR": "3192",
                "INDIAN AIRLINES": "3193",
                "HAWAIIAN AIR": "3196",
                "HAVASU AIRLINES": "3197",
                "FUYANA AIRWAYS": "3200",
                "GOLDEN PACIFIC AIR": "3203",
                "FREEDOM AIR": "3204",
                "DOMINICANA": "3212",
                "DAN AIR SERVICES": "3215",
                "CUMBERLAND AIRLINES": "3216",
                "CSA": "3217",
                "CROWN AIR": "3218",
                "COPA": "3219",
                "COMPANIA FAUCETT": "3220",
                "TRANSPORTES AEROS MILITARES ECCUATORANOS": "3221",
                "COMMAND AIRWAYS": "3222",
                "COMAIR": "3223",
                "CAYMAN AIRWAYS": "3228",
                "SAETA SOCIAEDAD ECUATORIANOS DE TRANSPORTES AEREOS": "3229",
                "SASHA SERVICIO AERO DE HONDURAS": "3231",
                "CAPITOL AIR": "3233",
                "BWIA": "3234",
                "BROKWAY AIR": "3235",
                "BEMIDJI AIRLINES": "3238",
                "BAR HARBOR AIRLINES": "3239",
                "BAHAMASAIR": "3240",
                "AVIATECA (GUATEMALA)": "3241",
                "AVENSA": "3242",
                "AUSTRIAN AIR SERVICE": "3243",
                "ALOHA AIRLINES": "3251",
                "ALM": "3252",
                "AMERICA WEST": "3253",
                "TRUMP AIRLINE": "3254",
                "ALASKA AIRLINES": "3256",
                "AMERICAN TRANS AIR": "3259",
                "AIR CHINA": "3261",
                "RENO AIR, INC.": "3262",
                "AIR SEYCHELLES": "3266",
                "AIR PANAMA": "3267",
                "AIR JAMAICA": "3280",
                "AIR DJIBOUTI": "3282",
                "AERO VIRGIN ISLANDS": "3284",
                "AERO PERU": "3285",
                "AEROLINEAS NICARAGUENSIS": "3286",
                "AERO COACH AVAIATION": "3287",
                "CYPRUS AIRWAYS": "3292",
                "ECUATORIANA": "3293",
                "ETHIOPIAN AIRLINES": "3294",
                "KENYA AIRLINES": "3295",
                "AIR MAURITIUS": "3298",
                "WIDERO’S FLYVESELSKAP": "3299",
                "AFFILIATED AUTO RENTAL": "3351",
                "AMERICAN INTL RENT-A-CAR": "3352",
                "BROOKS RENT-A-CAR": "3353",
                "ACTION AUTO RENTAL": "3354",
                "Car Rental": [
                    "3355",
                    "3374",
                    "3380",
                    "3388",
                    "3441"
                ],
                "HERTZ RENT-A-CAR": "3357",
                "PAYLESS CAR RENTAL": "3359",
                "SNAPPY CAR RENTAL": "3360",
                "AIRWAYS RENT-A-CAR": "3361",
                "ALTRA AUTO RENTAL": "3362",
                "AGENCY RENT-A-CAR": "3364",
                "BUDGET RENT-A-CAR": "3366",
                "HOLIDAY RENT-A-WRECK": "3368",
                "RENT-A-WRECK": "3370",
                "AJAX RENT-A-CAR": "3376",
                "EUROP CAR": "3381",
                "TROPICAL RENT-A-CAR": "3385",
                "SHOWCASE RENTAL CARS": "3386",
                "ALAMO RENT-A-CAR": "3387",
                "AVIS RENT-A-CAR": "3389",
                "DOLLAR RENT-A-CAR": "3390",
                "EUROPE BY CAR": "3391",
                "NATIONAL CAR RENTAL": "3393",
                "KEMWELL GROUP RENT-A-CAR": "3394",
                "THRIFTY RENT-A-CAR": "3395",
                "TILDEN TENT-A-CAR": "3396",
                "ECONO-CAR RENT-A-CAR": "3398",
                "AUTO HOST COST CAR RENTALS": "3400",
                "ENTERPRISE RENT-A-CAR": "3405",
                "GENERAL RENT-A-CAR": "3409",
                "A-1 RENT-A-CAR": "3412",
                "GODFREY NATL RENT-A-CAR": "3414",
                "ANSA INTL RENT-A-CAR": "3420",
                "ALLSTAE RENT-A-CAR": "3421",
                "AVCAR RENT-A-CAR": "3423",
                "AUTOMATE RENT-A-CAR": "3425",
                "AVON RENT-A-CAR": "3427",
                "CAREY RENT-A-CAR": "3428",
                "INSURANCE RENT-A-CAR": "3429",
                "MAJOR RENT-A-CAR": "3430",
                "REPLACEMENT RENT-A-CAR": "3431",
                "RESERVE RENT-A-CAR": "3432",
                "UGLY DUCKLING RENT-A-CAR": "3433",
                "USA RENT-A-CAR": "3434",
                "VALUE RENT-A-CAR": "3435",
                "AUTOHANSA RENT-A-CAR": "3436",
                "CITE RENT-A-CAR": "3437",
                "INTERENT RENT-A-CAR": "3438",
                "MILLEVILLE RENT-A-CAR": "3439",
                "HOLIDAY INNS, HOLIDAY INN EXPRESS": "3501",
                "BEST WESTERN HOTELS": "3502",
                "SHERATON HOTELS": "3503",
                "HILTON HOTELS": "3504",
                "FORTE HOTELS": "3505",
                "GOLDEN TULIP HOTELS": "3506",
                "FRIENDSHIP INNS": "3507",
                "QUALITY INNS, QUALITY SUITES": "3508",
                "MARRIOTT HOTELS": "3509",
                "DAYS INN, DAYSTOP": "3510",
                "ARABELLA HOTELS": "3511",
                "INTER-CONTINENTAL HOTELS": "3512",
                "WESTIN HOTELS": "3513",
                "Hotels/Motels/Inns/Resorts": [
                    "3514",
                    "3526",
                    "3539",
                    "3546",
                    "3547",
                    "3551",
                    "3554",
                    "3555",
                    "3556",
                    "3557",
                    "3559",
                    "3560",
                    "3561",
                    "3564",
                    "3566",
                    "3567",
                    "3569",
                    "3571",
                    "3576",
                    "3578",
                    "3580",
                    "3582",
                    "3589",
                    "3594",
                    "3596",
                    "3597",
                    "3600",
                    "3601",
                    "3602",
                    "3604",
                    "3605",
                    "3606",
                    "3607",
                    "3608",
                    "3609",
                    "3610",
                    "3611",
                    "3613",
                    "3614",
                    "3616",
                    "3617",
                    "3618",
                    "3619",
                    "3621",
                    "3624",
                    "3627",
                    "3628",
                    "3630",
                    "3631",
                    "3632",
                    "3662",
                    "3667",
                    "3669",
                    "3676",
                    "3680",
                    "3683",
                    "3708",
                    "3735",
                    "3757",
                    "3758",
                    "3759",
                    "3760",
                    "3761",
                    "3762",
                    "3763",
                    "3764",
                    "3765",
                    "3766",
                    "3767",
                    "3768",
                    "3769",
                    "3770",
                    "3771",
                    "3772",
                    "3773",
                    "3774",
                    "3775",
                    "3776",
                    "3777",
                    "3778",
                    "3779",
                    "3780",
                    "3781",
                    "3782",
                    "3783",
                    "3784",
                    "3785",
                    "3786",
                    "3787",
                    "3788",
                    "3789",
                    "3790"
                ],
                "RODEWAY INNS": "3515",
                "LA QUINTA MOTOR INNS": "3516",
                "AMERICANA HOTELS": "3517",
                "SOL HOTELS": "3518",
                "PULLMAN INTERNATIONAL HOTELS": "3519",
                "MERIDIEN HOTELS": "3520",
                "CREST HOTELS (see FORTE HOTELS)": "3521",
                "TOKYO HOTEL": "3522",
                "PENNSULA HOTEL": "3523",
                "WELCOMGROUP HOTELS": "3524",
                "DUNFEY HOTELS": "3525",
                "DOWNTOWNER-PASSPORT HOTEL": "3527",
                "RED LION HOTELS, RED LION INNS": "3528",
                "CP HOTELS": "3529",
                "RENAISSANCE HOTELS, STOUFFER HOTELS": "3530",
                "ASTIR HOTELS": "3531",
                "SUN ROUTE HOTELS": "3532",
                "HOTEL IBIS": "3533",
                "SOUTHERN PACIFIC HOTELS": "3534",
                "HILTON INTERNATIONAL": "3535",
                "AMFAC HOTELS": "3536",
                "ANA HOTEL": "3537",
                "CONCORDE HOTELS": "3538",
                "IBEROTEL HOTELS": "3540",
                "HOTEL OKURA": "3541",
                "ROYAL HOTELS": "3542",
                "FOUR SEASONS HOTELS": "3543",
                "CIGA HOTELS": "3544",
                "SHANGRI-LA INTERNATIONAL": "3545",
                "HOTELES MELIA": "3548",
                "AUBERGE DES GOVERNEURS": "3549",
                "REGAL 8 INNS": "3550",
                "COAST HOTELS": "3552",
                "PARK INNS INTERNATIONAL": "3553",
                "JOLLY HOTELS": "3558",
                "COMFORT INNS": "3562",
                "JOURNEY’S END MOTLS": "3563",
                "RELAX INNS": "3565",
                "LADBROKE HOTELS": "3568",
                "FORUM HOTELS": "3570",
                "MIYAKO HOTELS": "3572",
                "SANDMAN HOTELS": "3573",
                "VENTURE INNS": "3574",
                "VAGABOND HOTELS": "3575",
                "MANDARIN ORIENTAL HOTEL": "3577",
                "HOTEL MERCURE": "3579",
                "DELTA HOTEL": "3581",
                "SAS HOTELS": "3583",
                "PRINCESS HOTELS INTERNATIONAL": "3584",
                "HUNGAR HOTELS": "3585",
                "SOKOS HOTELS": "3586",
                "DORAL HOTELS": "3587",
                "HELMSLEY HOTELS": "3588",
                "FAIRMONT HOTELS": "3590",
                "SONESTA HOTELS": "3591",
                "OMNI HOTELS": "3592",
                "CUNARD HOTELS": "3593",
                "HOSPITALITY INTERNATIONAL": "3595",
                "REGENT INTERNATIONAL HOTELS": "3598",
                "PANNONIA HOTELS": "3599",
                "NOAH’S HOTELS": "3603",
                "MOVENPICK HOTELS": "3612",
                "TRAVELODGE": "3615",
                "TELFORD INTERNATIONAL": "3620",
                "MERLIN HOTELS": "3622",
                "DORINT HOTELS": "3623",
                "HOTLE UNIVERSALE": "3625",
                "PRINCE HOTELS": "3626",
                "DAN HOTELS": "3629",
                "RANK HOTELS": "3633",
                "SWISSOTEL": "3634",
                "RESO HOTELS": "3635",
                "SAROVA HOTELS": "3636",
                "RAMADA INNS, RAMADA LIMITED": "3637",
                "HO JO INN, HOWARD JOHNSON": "3638",
                "MOUNT CHARLOTTE THISTLE": "3639",
                "HYATT HOTEL": "3640",
                "SOFITEL HOTELS": "3641",
                "NOVOTEL HOTELS": "3642",
                "STEIGENBERGER HOTELS": "3643",
                "ECONO LODGES": "3644",
                "QUEENS MOAT HOUSES": "3645",
                "SWALLOW HOTELS": "3646",
                "HUSA HOTELS": "3647",
                "DE VERE HOTELS": "3648",
                "RADISSON HOTELS": "3649",
                "RED ROOK INNS": "3650",
                "IMPERIAL LONDON HOTEL": "3651",
                "EMBASSY HOTELS": "3652",
                "PENTA HOTELS": "3653",
                "LOEWS HOTELS": "3654",
                "SCANDIC HOTELS": "3655",
                "SARA HOTELS": "3656",
                "OBEROI HOTELS": "3657",
                "OTANI HOTELS": "3658",
                "TAJ HOTELS INTERNATIONAL": "3659",
                "KNIGHTS INNS": "3660",
                "METROPOLE HOTELS": "3661",
                "HOTELES EL PRESIDENTS": "3663",
                "FLAG INN": "3664",
                "HAMPTON INNS": "3665",
                "STAKIS HOTELS": "3666",
                "MARITIM HOTELS": "3668",
                "ARCARD HOTELS": "3670",
                "ARCTIA HOTELS": "3671",
                "CAMPANIEL HOTELS": "3672",
                "IBUSZ HOTELS": "3673",
                "RANTASIPI HOTELS": "3674",
                "INTERHOTEL CEDOK": "3675",
                "CLIMAT DE FRANCE HOTELS": "3677",
                "CUMULUS HOTELS": "3678",
                "DANUBIUS HOTEL": "3679",
                "ADAMS MARK HOTELS": "3681",
                "ALLSTAR INNS": "3682",
                "BUDGET HOST INNS": "3684",
                "BUDGETEL HOTELS": "3685",
                "SUISSE CHALETS": "3686",
                "CLARION HOTELS": "3687",
                "COMPRI HOTELS": "3688",
                "CONSORT HOTELS": "3689",
                "COURTYARD BY MARRIOTT": "3690",
                "DILLION INNS": "3691",
                "DOUBLETREE HOTELS": "3692",
                "DRURY INNS": "3693",
                "ECONOMY INNS OF AMERICA": "3694",
                "EMBASSY SUITES": "3695",
                "EXEL INNS": "3696",
                "FARFIELD HOTELS": "3697",
                "HARLEY HOTELS": "3698",
                "MIDWAY MOTOR LODGE": "3699",
                "MOTEL 6": "3700",
                "GUEST QUARTERS (Formally PICKETT SUITE HOTELS)": "3701",
                "THE REGISTRY HOTELS": "3702",
                "RESIDENCE INNS": "3703",
                "ROYCE HOTELS": "3704",
                "SANDMAN INNS": "3705",
                "SHILO INNS": "3706",
                "SHONEY’S INNS": "3707",
                "SUPER8 MOTELS": "3709",
                "THE RITZ CARLTON HOTELS": "3710",
                "FLAG INNS (AUSRALIA)": "3711",
                "GOLDEN CHAIN HOTEL": "3712",
                "QUALITY PACIFIC HOTEL": "3713",
                "FOUR SEASONS HOTEL (AUSTRALIA)": "3714",
                "FARIFIELD INN": "3715",
                "CARLTON HOTELS": "3716",
                "CITY LODGE HOTELS": "3717",
                "KAROS HOTELS": "3718",
                "PROTEA HOTELS": "3719",
                "SOUTHERN SUN HOTELS": "3720",
                "HILTON CONRAD": "3721",
                "WYNDHAM HOTEL AND RESORTS": "3722",
                "RICA HOTELS": "3723",
                "INER NOR HOTELS": "3724",
                "SEAINES PLANATION": "3725",
                "RIO SUITES": "3726",
                "BROADMOOR HOTEL": "3727",
                "BALLY’S HOTEL AND CASINO": "3728",
                "JOHN ASCUAGA’S NUGGET": "3729",
                "MGM GRAND HOTEL": "3730",
                "HARRAH’S HOTELS AND CASINOS": "3731",
                "OPRYLAND HOTEL": "3732",
                "BOCA RATON RESORT": "3733",
                "HARVEY/BRISTOL HOTELS": "3734",
                "COLORADO BELLE/EDGEWATER RESORT": "3736",
                "RIVIERA HOTEL AND CASINO": "3737",
                "TROPICANA RESORT AND CASINO": "3738",
                "WOODSIDE HOTELS AND RESORTS": "3739",
                "TOWNPLACE SUITES": "3740",
                "MILLENIUM BROADWAY HOTEL": "3741",
                "CLUB MED": "3742",
                "BILTMORE HOTEL AND SUITES": "3743",
                "CAREFREE RESORTS": "3744",
                "ST. REGIS HOTEL": "3745",
                "THE ELIOT HOTEL": "3746",
                "CLUBCORP/CLUB RESORTS": "3747",
                "WELESLEY INNS": "3748",
                "THE BEVERLY HILLS HOTEL": "3749",
                "CROWNE PLAZA HOTELS": "3750",
                "HOMEWOOD SUITES": "3751",
                "PEABODY HOTELS": "3752",
                "GREENBRIAH RESORTS": "3753",
                "AMELIA ISLAND PLANATION": "3754",
                "THE HOMESTEAD": "3755",
                "SOUTH SEAS RESORTS": "3756",
                "Home2Suites": "3816",
                "Railroads": "4011",
                "Local/Suburban Commuter Passenger Transportation – Railroads, Feries, Local Water Transportation.": "4111",
                "Passenger Railways": "4112",
                "Taxicabs and Limousines": "4121",
                "Bus Lines, Including Charters, Tour Buses": "4131",
                "Cruise and Steamship Lines": "4411",
                "Marinas, Marine Service, and Supplies": "4468",
                "Airlines, Air Carriers ( not listed elsewhere)": "4511",
                "Airports, Airport Terminals, Flying Fields": "4582",
                "Travel Agencies and Tour Operations": "4722",
                "Package Tour Operators (For use in Germany only)": "4723",
                "Toll and Bridge Fees": "4784",
                "Transportation Services, Not elsewhere classified)": "4789",
                "Duty Free Store": "5309",
                "Lodging – Hotels, Motels, Resorts, Central Reservation Services (not elsewhere classified)": "7011",
                "Car Rental Companies ( Not Listed Below)": "7512",
                "Truck and Utility Trailer Rentals": "7513",
                "Motor Home and Recreational Vehicle Rentals": "7519"
            },
        },
        shopping: {
            pattern: /шопинг/i,
            category: {
                "Men’s Women’s and Children’s Uniforms and Commercial Clothing": "5137",
                "Commercial Footwear": "5139",
                "Department stores": "5311",
                "Men’s and Boy’s Clothing and Accessories Stores": "5611",
                "Women’s Ready-to-Wear Stores": "5621",
                "Women’s Accessory and Specialty Shops": "5631",
                "Family Clothing Stores": "5651",
                "Sports Apparel, Riding Apparel Stores": "5655",
                "Shoe Stores": "5661",
                "Furriers and Fur Shops": "5681",
                "Men’s and Women’s Clothing Stores": "5691",
                "Men's and women's clothing stores": "5691",
                "Tailors, Seamstress, Mending, and Alterations": "5697",
                "Wig and Toupee Stores": "5698",
                "Miscellaneous Apparel and Accessory Shops": "5699",
                "Miscellaneous apparel and accessory stores": "5699",
                "Used Merchandise and Secondhand Stores": "5931",
                "Leather Foods Stores": "5948",
                "Sewing, Needle, Fabric, and Price Goods Stores": "5949",
                "Cosmetic Stores": "5977",
                "Barber and Beauty Shops": "7230",
                "Shop Repair Shops and Shoe Shine Parlors, and Hat Cleaning Shops": "7251",
                "Clothing Rental – Costumes, Formal Wear, Uniforms": "7296",
                "Massage Parlors": "7297",
                "Health and Beauty Shops": "7298",
                "Health and beauty spas": "7298",
                "Commercial Sports, Athletic Fields, Professional Sport Clubs, and Sport Promoters": "7941",
                "Golf Courses – Public": "7992",
                "Membership Clubs (Sports, Recreation, Athletic), Country Clubs, and Private Golf Courses": "7997",
                "Membership clubs (sports, recreation, athletic), country clubs, private golf courses": "7997"
            },
        },
        relax: {
            pattern: /рестораны/i,
            category: {
                "Bakeries": "5462",
                "Caterers": "5811",
                "Eating places and Restaurants": "5812",
                "Eating places, restaurants": "5812",
                "Drinking Places (Alcoholic Beverages), Bars, Taverns, Cocktail lounges, Nightclubs and Discotheques": "5813",
                "Drinking places (alcoholic beverages) - bars, taverns, nightclubs, cocktail lunges, discotheques": "5813",
                "Fast Food Restaurants": "5814",
                "Motion Pictures and Video Tape Production and Distribution": "7829",
                "Motion Picture Theaters": "7832",
                "Video Tape Rental Stores": "7841",
                "Dance Halls, Studios and Schools": "7911",
                "Theatrical Producers (Except Motion Pictures), Ticket Agencies": "7922",
                "Bands, Orchestras, and Miscellaneous Entertainers (Not Elsewhere Classified)": "7929",
                "Billiard and Pool Establishments": "7932",
                "Bowling Alleys": "7933",
                "Tourist Attractions and Exhibits": "7991",
                "Video Amusement Game Supplies": "7993",
                "Video Game Arcades/Establishments": "7994",
                "Amusement Parks, Carnivals, Circuses, Fortune Tellers": "7996",
                "Amusement parks, сircuses, carnivals, fortune tellers": "7996",
                "Aquariums, Sea-aquariums, Dolphinariums": "7998",
                "Recreation services (including swimming pools, miniature golf and driving ranges, ski slopes, spot and games instruction, boat rentals and aircraft re": "7999",
                "Recreation Services (Not Elsewhere Classified)": "7999"
            }
        },
    };


    function log(data) {
        if (LOG) console.log(data);
    }

    function getCardCategory(last4Digit) {
        return localStorage[PREFIX + ".card" + last4Digit];
    }

    function setCardCategory(last4Digit, sCategory) {
        localStorage[PREFIX + ".card" + last4Digit] = sCategory;
    }

    function getMCC4Category(oType, sMC) {
        if (!sMC) return null;
        var result = oType.category[sMC];
        if (!result) {
            var sUC_MC = sMC.toUpperCase();
            for (var sProp in oType.category) {
                if (sUC_MC.startsWith(sProp.toUpperCase())) {
                    result = oType.category[sProp];
                    break;
                }
            }
        }
        if (result && Array.isArray(result)) {
            result = result[0]; //Cant detect MCC exactly
        }
        return result;
    }

    function DateFromStr(sDate) {
        var aDate = sDate.split("/");
        return new Date(aDate[2], aDate[1] - 1, aDate[0]);
    }

    function fixOperation(oOperation) {
        if (oOperation && oOperation.mcc) {
            var fix = MCCFix[oOperation.mcc];
            if (fix) {
                if (fix.date) {
                    oOperation.perc = fix.date(oOperation.date)
                }
            }
        }
    }

    function getOperationFromCache(sCard, sDate, sPlace) {
        var sData = localStorage[PREFIX + ".op." + sCard + "." + sDate + "." + sPlace];
        var oOperation = null;
        if (sData) {
            if (sData.indexOf("{") != 0) {
                var aData = sData.split(":");
                oOperation = {
                    mcc: aData[0] || "",
                    perc: aData[1] || 0,
                    sumRUR: aData[2] || 0
                };
                setOperationToCache(sCard, sDate, sPlace, oOperation);
            } else {
                oOperation = JSON.parse(sData);
            }
            oOperation.date = DateFromStr(sDate);
            fixOperation(oOperation);
        }
        return oOperation;
    }

    function setOperationToCache(sCard, sDate, sPlace, oOperation) {
        localStorage[PREFIX + ".op." + sCard + "." + sDate + "." + sPlace] = JSON.stringify(oOperation);
    }



    function getOperationAsync(sCard, sDate, sPlace, bIsRUR, fnGetOtpCategory, bReturn) {
        sPlace = sPlace.replace(/\s+/g, " ");
        var oOperation = getOperationFromCache(sCard, sDate, sPlace);
        if (oOperation) {
            if ((bIsRUR || oOperation.sumRUR) && (!!oOperation.return == bReturn)) {
                return Promise.resolve(oOperation);
            }
        }
        return new Promise((resolve, reject) => {
            fnGetOtpCategory()
                .then(oResult => {
                    var oOperation = {
                        date: DateFromStr(sDate)
                    };
                    if (bReturn) {
                        oOperation.return = bReturn;
                    }
                    var otpCat = oResult.cat;
                    if (otpCat) {
                        oOperation.sumRUR = oResult.sum_rur || "";
                        oOperation.mcc = getMCC4Category(CardTypes.no_cb, otpCat);
                        if (oOperation.mcc) {
                            oOperation.perc = 0;
                        } else {
                            if (sCard) {
                                var sCardCategory = getCardCategory(sCard);
                                if (sCardCategory) {
                                    var oCardType = CardTypes[sCardCategory];
                                    if (oCardType) {
                                        var sMCC = getMCC4Category(oCardType, otpCat);
                                        if (sMCC) {
                                            oOperation.mcc = sMCC;
                                            oOperation.perc = 7;
                                        } else {
                                            for (var sCat in CardTypes) {
                                                if (sCat !== sCardCategory) {
                                                    oCardType = CardTypes[sCat];
                                                    sMCC = getMCC4Category(oCardType, otpCat);
                                                    if (sMCC) {
                                                        oOperation.mcc = sMCC;
                                                        oOperation.perc = 1;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (oOperation.mcc) {
                            fixOperation(oOperation);
                            setOperationToCache(sCard, sDate, sPlace, oOperation);
                        } else {
                            oOperation.perc = 1;
                        }
                    } else {
                        oOperation = null;
                    }
                    resolve(oOperation);
                },
                    err => reject(err));
        });
    }

    function isPayTransaction(sText) {
        if (sText.indexOf("Выплата вознаграждения за покупки по банковской карте") >= 0 ||
            sText.match(/OTPdirekt/i) ||
            sText.match(/CARD2CARD\s+OTP/i) ||
            sText.indexOf('Начисление процентов на положит') >= 0
        ) {
            return false;
        }
        return true;
    }

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    function processList() {
        var cardName = $("#chooseSource option:selected").text();
        if (!cardName) return;
        var sCardCategory = null;
        var matches = cardName.match(/\*{4}\s+(\d+)/);
        if (matches && matches.length == 2) {
            var last4Digit = matches[1];
            if (!last4Digit) return; //Cant detect card number;
            sCardCategory = getCardCategory(last4Digit);
            if (!sCardCategory) {
                for (var prop in CardTypes) {
                    var oType = CardTypes[prop];
                    if (oType.exclude) continue;
                    if (cardName.match(oType.pattern)) {
                        sCardCategory = prop;
                        setCardCategory(last4Digit, sCardCategory);
                        break;
                    }
                }
            }
        }
        if (!sCardCategory) return;

        function _createGetCategoryCallBack(sUrl) {
            var sUrlLocal = sUrl;
            return function () {
                return window.fetch(sUrlLocal)
                    .then(oResponse => oResponse.text())
                    .then(sHtml => {
                        var oResult = {};
                        var matches = sHtml.match(/<th>\s*Категория\s+торговой\s+точки\s*<\/th>[^<]*<td>([^<]+)<\/td>/i);
                        if (matches && matches.length == 2) {
                            oResult.cat = decodeHtml(matches[1].trim());
                        } else {
                            matches = sHtml.match(/<th>\s*Место\s*<\/th>[^<]*<td>([^<]+)<\/td>/i);
                            if (matches && matches.length == 2) {
                                var place = decodeHtml(matches[1].trim());
                                if (place.startsWith('STEAMGAMES.COM')) {
                                    oResult.cat = 'Video Game Arcades/Establishments';
                                }
                            }
                        }

                        if (oResult.cat) {
                            matches = sHtml.match(/<th>\s*Сумма\s+в\s+валюте\s+счета\s*<\/th>[^<]*<td>([^<]+)RUR[^<]*<\/td>/i);
                            if (matches && matches.length == 2) {
                                oResult.sum_rur = matches[1].trim().replace(/\s+/g, "");
                            }
                        }

                        return oResult;
                    });
            };
        }
        var oCashBackPerMonth = {};
        var aOperAsync = [];
        $("#szamlatortenet_eredmeny > tbody > tr").each(function (index, tr) {
            var oTr = $(tr);
            var bPay = true;
            var sDate = "";
            var sUrl = "";
            var sPlace = "";
            var bCredit = true;
            var sCost = "";
            var oTdPlace = null;
            var oTdCost = null;
            oTr.find("td").each((index, el) => {
                var oTd = $(el);
                var sText = oTd.text().trim();
                switch (index) {
                    case 1:
                        sDate = sText;
                        break;
                    case 2:
                        if (!isPayTransaction(sText)) {
                            bPay = false;
                            return false;
                        } else {
                            sPlace = sText;
                        }
                        oTdPlace = el;
                        break;
                    case 3:
                        if (el.id == "greenDebit" && sText) {
                            sCost = sText;
                            bCredit = false;
                        }
                        oTdCost = el;
                        break;
                    case 4:
                        if (el.id == "redCredit" && sText) {
                            sCost = sText;
                        } else if (!bCredit) {
                            oTdCost = el;
                        }
                        break;
                    case 7:
                        sUrl = $(oTd).find("a").attr("href");
                }
            });
            if (sCost && bPay) {
                var bRUR = !!(sCost.match("RUR"));
                if (!bRUR) {
                    //If foreign currency then add amount as part of Place, because caching amount in RUR
                    sPlace = sPlace + "." + sCost.replace(/[\s\-]+/g, "");
                }
                aOperAsync.push(getOperationAsync(last4Digit, sDate, sPlace, bRUR, _createGetCategoryCallBack(sUrl), !bCredit)
                    .then(oOperation => {
                        if (!oOperation) return; //Если операция не найдена - не обрабатываем ее
                        if (oOperation.mcc) {
                            //Если есть МСС записываем его сразу
                            oTdPlace.innerHTML = oTdPlace.innerText + "&nbsp-&nbspMCC:" + oOperation.mcc;
                        }
                        if (!bRUR && oOperation.sumRUR) {
                            //Если операция в валюте, переписываем сумму на сумму в рублях из операции
                            sCost = oOperation.sumRUR;
                        }
                        //Парсим сумму в вещественное и записываем в операцию
                        var fCost = Math.abs(parseFloat(sCost.replace(/\s+/g, "")));
                        oOperation.fCost = fCost;

                        if (oOperation.return) {
                            //Если это был возврат - меняем знак в сумме операции
                            oOperation.fCost *= -1;
                        }

                        //Определяем год и месяц
                        var aDate = sDate.split("/");
                        var oDate = DateFromStr(sDate);
                        oOperation.oDate = oDate;
                        // var aDate = sDate.split("/");
                        var sMonth = "" + aDate[1] + "." + aDate[2];
                        // Ищем месяц по массиве
                        var oMonth = oCashBackPerMonth[sMonth];
                        if (!oMonth) {
                            //Если не найден - создаем пустой
                            oMonth = {
                                iMonth: ("" + aDate[2] + aDate[1]) - 0, //Записываем год+месяц как число
                                fTotal: 0.0,
                                fTotal4CB: 0.0,
                                fEffCB: 0.0,
                                iPercent: 0,
                                fCB: 0.0,
                                aOper: []
                            };
                            //Добавляем новый месяц в массив
                            oCashBackPerMonth.length = (oCashBackPerMonth.length | 0) + 1;
                            oCashBackPerMonth[sMonth] = oMonth;
                        }
                        //Сохраняем в операции ссылку на <td> элемент, куда будем писать CashBack
                        oOperation.oTdCost = oTdCost;
                        //Добавляем операцию в массив операций по месяцу
                        oMonth.aOper.push(oOperation);
                    }, err => true));
            }
        });

        Promise.all(aOperAsync)
            .then(_ => {
                //После асинхронной обработки всех операций
                if (oCashBackPerMonth.length) {
                    //Если есть помесячные
                    delete oCashBackPerMonth.length; //удаляем длину чтобы не мешалась в массиве
                    //Создаем таблицу для вывода суммарной информации
                    var oDivDetail = $("#details");
                    var oDivCB = $('<div id="details"></div>');
                    oDivCB.append($('<div class="highlighted financialInfo"><h2 class="tableName">Планируемый CashBack</h2></div>'));
                    //Добавляем заголовок
                    var oCBTable = $('<table id="cb_per_month" class="eredmenytabla"><thead><tr class="odd"><th>Месяц</th><th>Потрачено</th><th>CashBack</th><th>Эффективный % CashBack</th></tr></thead></table>');
                    var oCBTableBody = $('<tbody></tbody>');
                    var iRow = 0;
                    for (var sMonth in oCashBackPerMonth) {
                        //Для каждого месяца в массиве
                        var oMonth = oCashBackPerMonth[sMonth];
                        //Определяем класс дял четнйо и нечетной строк
                        var sClass = iRow++ % 2 == 0 ? "paros" : "paratlan odd";
                        //Считаем суммарный оборот и оборот для расчета КБ по операциям месяца
                        for (var i in oMonth.aOper) {
                            var oOperation = oMonth.aOper[i];
                            oMonth.fTotal += oOperation.fCost;
                            var iPercent = oOperation.perc - 0;
                            if (iPercent) {
                                //Не бонусируемые операции не учитываем в обороте для КБ
                                oMonth.fTotal4CB += oOperation.fCost;
                            }
                        }
                        //Определяем % повышенного КБ за месяц
                        if (oMonth.iMonth < 201907) {
                            //Если период до 07.2019, то оборот не учитываем - повышенный КБ всегда 7
                            oMonth.iPercent = 7;
                        } else {
                            //С 07.2019 учитываем оборот для расчета % повышенного КБ
                            if (oMonth.fTotal4CB < 30000) {
                                oMonth.iPercent = 1;
                            } else if (oMonth.fTotal4CB < 50000) {
                                oMonth.iPercent = 3;
                            } else if (oMonth.fTotal4CB < 70000) {
                                oMonth.iPercent = 5;
                            } else {
                                oMonth.iPercent = 7;
                            }
                        }
                        //Сортируем операции в пределах месяца по дате
                        oMonth.aOper.sort(function (a, b) { return a.oDate.getTime() - b.oDate.getTime() });

                        //Определяем % КБ по каждой операции
                        for (i in oMonth.aOper) {
                            oOperation = oMonth.aOper[i];
                            //Определяем плануруемый %КБ по операции
                            iPercent = oOperation.perc - 0;
                            if (oOperation.fCost < 100) {
                                //Если сумма операции менее 100 руб - Кб нет, % = 0
                                iPercent = 0;
                            } else {
                                if (iPercent == 7) {
                                    //Если операция подпадает под повышенный КБ, берем КБ из месяца (для новых условий - зависимый от оборота)
                                    iPercent = oMonth.iPercent;
                                }
                                //Рассчитываем сумму КБ по операции
                                var fCB = Math.round(oOperation.fCost * iPercent) / 100;
                                if (oMonth.fCB == 3000) {
                                    //Если уже достигли порога в 3000, операции без КБ (считаем нарастающим итогом)
                                    fCB = 0.0;
                                } else {
                                    //Суммируем КБ по операции с КБ за месяц
                                    oMonth.fCB += fCB;
                                    if (oMonth.fCB > 3000) {
                                        //если превысили порог в 3000 - КБ по операции  частичный
                                        fCB = Math.round((fCB - (oMonth.fCB - 3000)) * 100) / 100;
                                        oMonth.fCB = 3000;
                                    }
                                }
                                //Записываем Кб по опреации в итоговую ячейку
                                oOperation.oTdCost.innerHTML = oOperation.oTdCost.innerHTML + '<span class="cb' + oOperation.perc + '">CB: ' + fCB + "</span>";
                            }
                        }
                        oMonth.fTotal = Math.round(oMonth.fTotal * 100) / 100;
                        oMonth.fCB = Math.round(oMonth.fCB * 100) / 100;
                        //Рассчитываем эффективный КБ
                        oMonth.fEffCB = Math.round(oMonth.fCB * 100 / oMonth.fTotal * 100) / 100;
                        //Добавляем данные по месяцу в таблицу
                        oCBTableBody.append($('<tr class="' + sClass + '"><td>' + sMonth + '</td><td nowrap="nowrap" id="greenDebit">' + oMonth.fTotal + '</td><td>' + oMonth.fCB + '</td><td>' + oMonth.fEffCB + '</td></tr>'));
                    }
                    oCBTable.append(oCBTableBody);
                    oDivCB.append(oCBTable);
                    oDivDetail.parent().append(oDivCB);
                }
            });
    }

    function processDetail() {
        var last4Digit = "";
        var otpCat = "";
        var oTdCost = null;
        var oTdCat = null;
        var sDate = null;
        var sCity = null;
        var sTSP = null;
        var sCostCurr = null;
        $("#details > table.allapot_informacio_keskeny > tbody > tr").each(function (index, tr) {
            var oTr = $(tr);
            var label = oTr.find("th").text().trim();
            if (!last4Digit && label.match(/Номер\s+карты/i)) {
                var value = oTr.find("td").text().trim();
                var matches = value.match(/\*{4}\s+(\d+)/);
                if (matches.length == 2) {
                    last4Digit = matches[1];
                }
            }
            if (!otpCat && label.match(/Категория\s+торговой\s+точки/i)) {
                oTdCat = oTr.find("td");
                otpCat = oTdCat.text().trim();
                return;
            }
            if (!oTdCost && label.match(/Сумма\s+в\s+валюте\s+счета/i)) {
                oTdCost = oTr.find("td");
                return;
            }
            if (!sCostCurr && label.match(/Сумма\s+операции/i)) {
                sCostCurr = oTr.find("td").text().trim();
                return;
            }
            if (!sDate && label.match(/Дата\s+и\s+время\s+операции/i)) {
                sDate = oTr.find("td").text().trim();
                sDate = sDate.split(" ")[0].replace(/\./g, "/");
                return;
            }
            if (!sCity && label.match(/Город\s+торговой\s+точки/i)) {
                sCity = oTr.find("td").text().trim();
                return;
            }
            if (!sTSP && label.match(/Место/i)) {
                var oTSP = oTr.find("td");
                sTSP = oTSP.text().trim();

                if (!otpCat && sTSP.startsWith('STEAMGAMES.COM')) {
                    otpCat = 'Video Game Arcades/Establishments';
                    oTdCat = oTSP;
                }

                return;
            }

            if (otpCat && last4Digit && oTdCost && sDate && sCity && sTSP && sCostCurr) return false;
        });

        if (!sTSP || sTSP.match(/OTPdirekt/i) || sTSP.match(/CARD2CARD/i) || sTSP.match(/Payment\s+Transaction.+Member/i) || !sCity || !otpCat) return;

        var sPlace = sTSP + " - " + sCity;
        var bRUR = !!(sCostCurr.match("RUR"));
        if (!bRUR) {
            //If foreign currency then add amount as part of Place, because caching amount in RUR
            sPlace = sPlace + "." + sCostCurr.replace(/[\s\-]+/g, "");
        }


        getOperationAsync(last4Digit, sDate, sPlace, true, function () {
            return Promise.resolve({
                cat: otpCat,
                sum_rur: oTdCost.text().trim()
            });
        }).then(oOperation => {
            if (!oOperation) return;
            fixOperation(oOperation);
            var sMCC = oOperation.mcc;
            if (oTdCat && sMCC) {
                oTdCat.html("" + sMCC + ":&nbsp;" + otpCat);
            }
            //Определяем год и месяц
            var aDate = sDate.split("/");
            if ((aDate[2] + aDate[1]) - 0 < 201907) {

                var iPercent = oOperation.perc - 0;

                if (oTdCost) {
                    var sCost = oOperation.sumRUR;
                    var fCB = 0.00;
                    var fCost = parseFloat(sCost.replace(/\s+/g, ""));
                    if (fCost >= 100) {
                        fCB = Math.round(fCost * iPercent) / 100 + 0.00;
                        if (oOperation.return) {
                            fCB *= -1;
                        }
                    } else {
                        iPercent = 0;
                    }
                    oTdCost.html(sCost + '&nbsp<span class="cb' + iPercent + '">(CashBack:&nbsp' + fCB + ")</span>");
                }
            }
        });
    }

    log("OTP MCC Codes");
    $(document).ready(function () {
        log("Doc Ready");
        if (window.location.pathname.match("szamlatortenet")) {
            //Выписка
            processList();
        } else if (window.location.pathname.match("kartyaTranzakcioReszletek")) {
            //Operation detail
            processDetail();
        }
    });




})($);