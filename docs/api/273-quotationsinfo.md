# quotations.info

> Source: https://developer.focus.teamleader.eu/docs/api/quotations-info

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Quotations](/docs/api/quotations)
  * quotations.info



# quotations.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/quotations.info

Get a quotation.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`e7a3fe2b-2c75-480f-87b9-121816b5257b`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`e7a3fe2b-2c75-480f-87b9-121816b5257b`

**deal** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**grouped_lines** object[]

  * Array [

**section** object

**title** string

**line_items** object[]

  * Array [

**product** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**quantity** number

**Example:**`3`

**description** string

**Example:**`An awesome product`

**extended_description** string

Uses Markdown formatting

**Example:**`Some more information about this awesome product`

**unit** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**unit_price** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**tax** string

**Possible values:** [`excluding`]

**Example:**`excluding`

**tax** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**discount** objectnullable

**value** number

**Example:**`10`

**type** string

Values between 0 and 100

**Possible values:** [`percentage`]

**Example:**`percentage`

**total** object

**tax_exclusive** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**tax_exclusive_before_discount** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**tax_inclusive** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**tax_inclusive_before_discount** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**purchase_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**periodicity** objectnullable

oneOf

    * By Week
    * By Month
    * By Year

**unit** stringrequired

**Possible values:** [`week`]

**Example:**`week`

**period** numberrequired

**Possible values:** [`1`, `2`]

**Example:**`2`

**unit** stringrequired

**Possible values:** [`month`]

**Example:**`month`

**period** numberrequired

**Possible values:** [`1`, `2`, `3`, `4`, `6`]

**Example:**`4`

**unit** stringrequired

**Possible values:** [`year`]

**Example:**`year`

**period** numberrequired

**Possible values:** [`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`]

**Example:**`7`

  * ]

  * ]

**currency** string

**Example:**`USD`

**currency_exchange_rate** object

**from** CurrencyCode (string)

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**Example:**`USD`

**to** CurrencyCode (string)

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**Example:**`EUR`

**rate** number

**Example:**`1.1234`

**text** string

Uses Markdown formatting

**Example:**`Quotation text`

**total** object

**tax_exclusive** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**tax_inclusive** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**taxes** object[]

  * Array [

**rate** number

**Example:**`0.21`

**taxable** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**tax** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

  * ]

**purchase_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**discounts** object[]

  * Array [

**type** string

Values between 0 and 100

**Possible values:** [`percentage`]

**Example:**`percentage`

**value** number

**Example:**`15.5`

**description** string

**Example:**`winter promotion`

  * ]

**created_at** stringnullable

**Example:**`2017-05-09T11:25:11+00:00`

**updated_at** stringnullable

**Example:**`2017-05-09T11:30:58+00:00`

**status** string

**Possible values:** [`open`, `accepted`, `expired`, `rejected`, `closed`]

**Example:**`open`

**name** string

**Example:**`Webdevelopment`

**document_template** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**expiry** object

returned if user has access to quotation expiry and `includes=expiry` is requested

**expires_after** string

**Example:**`2023-04-05`

**action_after_expiry** string

**Possible values:** [`lock`, `none`]



    
    
    {  
      "data": {  
        "id": "e7a3fe2b-2c75-480f-87b9-121816b5257b",  
        "deal": {  
          "type": "deal",  
          "id": "53474a7a-f9b2-4dd4-88a8-40ce773c7a64"  
        },  
        "grouped_lines": [  
          {  
            "section": {  
              "title": ""  
            },  
            "line_items": [  
              {  
                "product": {  
                  "type": "product",  
                  "id": "e2314517-3cab-4aa9-8471-450e73449040"  
                },  
                "quantity": 3,  
                "description": "An awesome product",  
                "extended_description": "Some more information about this awesome product",  
                "unit": {  
                  "type": "unitOfMeasure",  
                  "id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71"  
                },  
                "unit_price": {  
                  "amount": 123.3,  
                  "currency": "EUR",  
                  "tax": "excluding"  
                },  
                "tax": {  
                  "type": "taxRate",  
                  "id": "e2314517-3cab-4aa9-8471-450e73449042"  
                },  
                "discount": {  
                  "type": "percentage",  
                  "value": 15  
                },  
                "purchase_price": {  
                  "amount": 123.3,  
                  "currency": "EUR"  
                },  
                "total": {  
                  "tax_exclusive": {  
                    "amount": 123.3,  
                    "currency": "EUR"  
                  },  
                  "tax_exclusive_before_discount": {  
                    "amount": 123.3,  
                    "currency": "EUR"  
                  },  
                  "tax_inclusive": {  
                    "amount": 123.3,  
                    "currency": "EUR"  
                  },  
                  "tax_inclusive_before_discount": {  
                    "amount": 123.3,  
                    "currency": "EUR"  
                  }  
                },  
                "periodicity": {  
                  "unit": "week",  
                  "period": 2  
                }  
              }  
            ]  
          }  
        ],  
        "currency": "USD",  
        "currency_exchange_rate": {  
          "from": "USD",  
          "to": "EUR",  
          "rate": 1.1234  
        },  
        "text": "Quotation text",  
        "total": {  
          "tax_exclusive": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "tax_inclusive": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "taxes": [  
            {  
              "rate": 0.21,  
              "taxable": {  
                "amount": 123.3,  
                "currency": "EUR"  
              },  
              "tax": {  
                "amount": 123.3,  
                "currency": "EUR"  
              }  
            }  
          ],  
          "purchase_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          }  
        },  
        "discounts": [  
          {  
            "type": "percentage",  
            "value": 15.5,  
            "description": "winter promotion"  
          }  
        ],  
        "created_at": "2017-05-09T11:25:11+00:00",  
        "updated_at": "2017-05-09T11:30:58+00:00",  
        "status": "open",  
        "name": "Webdevelopment",  
        "document_template": {  
          "type": "documentTemplate",  
          "id": "179e1564-493b-4305-8c54-a34fc80920fc"  
        },  
        "expiry": {  
          "expires_after": "2023-04-05",  
          "action_after_expiry": "lock"  
        }  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "e7a3fe2b-2c75-480f-87b9-121816b5257b",  
        "deal": {  
          "type": "deal",  
          "id": "53474a7a-f9b2-4dd4-88a8-40ce773c7a64"  
        },  
        "grouped_lines": [  
          {  
            "section": {  
              "title": ""  
            },  
            "line_items": [  
              {  
                "product": {  
                  "type": "product",  
                  "id": "e2314517-3cab-4aa9-8471-450e73449040"  
                },  
                "quantity": 3,  
                "description": "An awesome product",  
                "extended_description": "Some more information about this awesome product",  
                "unit": {  
                  "type": "unitOfMeasure",  
                  "id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71"  
                },  
                "unit_price": {  
                  "amount": 123.3,  
                  "currency": "EUR",  
                  "tax": "excluding"  
                },  
                "tax": {  
                  "type": "taxRate",  
                  "id": "e2314517-3cab-4aa9-8471-450e73449042"  
                },  
                "discount": {  
                  "type": "percentage",  
                  "value": 15  
                },  
                "purchase_price": {  
                  "amount": 123.3,  
                  "currency": "EUR"  
                },  
                "total": {  
                  "tax_exclusive": {  
                    "amount": 123.3,  
                    "currency": "EUR"  
                  },  
                  "tax_exclusive_before_discount": {  
                    "amount": 123.3,  
                    "currency": "EUR"  
                  },  
                  "tax_inclusive": {  
                    "amount": 123.3,  
                    "currency": "EUR"  
                  },  
                  "tax_inclusive_before_discount": {  
                    "amount": 123.3,  
                    "currency": "EUR"  
                  }  
                },  
                "periodicity": {  
                  "unit": "week",  
                  "period": 2  
                }  
              }  
            ]  
          }  
        ],  
        "currency": "USD",  
        "currency_exchange_rate": {  
          "from": "USD",  
          "to": "EUR",  
          "rate": 1.1234  
        },  
        "text": "Quotation text",  
        "total": {  
          "tax_exclusive": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "tax_inclusive": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "taxes": [  
            {  
              "rate": 0.21,  
              "taxable": {  
                "amount": 123.3,  
                "currency": "EUR"  
              },  
              "tax": {  
                "amount": 123.3,  
                "currency": "EUR"  
              }  
            }  
          ],  
          "purchase_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          }  
        },  
        "discounts": [  
          {  
            "type": "percentage",  
            "value": 15.5,  
            "description": "winter promotion"  
          }  
        ],  
        "created_at": "2017-05-09T11:25:11+00:00",  
        "updated_at": "2017-05-09T11:30:58+00:00",  
        "status": "open",  
        "name": "Webdevelopment",  
        "document_template": {  
          "type": "documentTemplate",  
          "id": "179e1564-493b-4305-8c54-a34fc80920fc"  
        },  
        "expiry": {  
          "expires_after": "2023-04-05",  
          "action_after_expiry": "lock"  
        }  
      }  
    }  
    

#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/quotations.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"e7a3fe2b-2c75-480f-87b9-121816b5257b\"\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body required

  * Example (from schema)
  * Example


    
    
    {
      "id": "e7a3fe2b-2c75-480f-87b9-121816b5257b"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
