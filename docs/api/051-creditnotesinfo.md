# creditNotes.info

> Source: https://developer.focus.teamleader.eu/docs/api/credit-notes-info

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Credit Notes](/docs/api/credit-notes)
  * creditNotes.info



# creditNotes.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/creditNotes.info

Get details for a single credit note

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`27300f09-6250-4a23-8557-d84c52f99ecf`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**Example:**`27300f09-6250-4a23-8557-d84c52f99ecf`

**department** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**credit_note_number** stringnullable

**Example:**`2017/5`

**credit_note_date** stringnullable

**Example:**`2016-02-04`

**status** string

**Possible values:** [`booked`]

**Example:**`booked`

**invoice** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**paid** boolean

**Example:**`true`

**paid_at** stringnullable

**Example:**`2016-03-03T16:44:33+00:00`

**invoicee** object

**name** string

**Example:**`De Rode Duivels`

**vat_number** stringnullable

**Example:**`BE0899623035`

**customer** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**email** stringnullable

**Example:**`duivels@test.com`

**national_identification_number** stringnullable

**Example:**`123`

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

**payable** object

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

**product_category** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

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

**created_at** string

**Example:**`2016-02-04T16:44:33+00:00`

**updated_at** string

**Example:**`2016-02-05T16:44:33+00:00`

**document_template** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**peppol_status** PeppolStatus (string)nullable

**Possible values:** [`sending`, `sending_failed`, `sent`, `application_acknowledged`, `application_accepted`, `application_rejected`, `receiver_acknowledged`, `receiver_accepted`, `receiver_rejected`, `receiver_is_processing`, `receiver_awaits_feedback`, `receiver_conditionally_accepted`, `receiver_paid`]

**Example:**`sent`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "27300f09-6250-4a23-8557-d84c52f99ecf",  
          "department": {  
            "type": "department",  
            "id": "36386b05-936e-4cc0-9523-bd20d797ebf5"  
          },  
          "credit_note_number": "2017/5",  
          "credit_note_date": "2016-02-04",  
          "status": "booked",  
          "invoice": {  
            "type": "invoice",  
            "id": "53484141-8382-4948-9a4c-9cd7e79b30bd"  
          },  
          "paid": true,  
          "paid_at": "2016-03-03T16:44:33+00:00",  
          "invoicee": {  
            "name": "De Rode Duivels",  
            "vat_number": "BE0899623035",  
            "customer": {  
              "type": "contact",  
              "id": "dc2a40bf-f050-4c8e-a002-872a051150b9"  
            },  
            "email": "duivels@test.com",  
            "national_identification_number": "123"  
          },  
          "discounts": [  
            {  
              "type": "percentage",  
              "value": 15.5,  
              "description": "winter promotion"  
            }  
          ],  
          "total": {  
            "tax_exclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "tax_inclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "payable": {  
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
            ]  
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
                  "product_category": {  
                    "id": "e2314517-3cab-4aa9-8471-450e73449041",  
                    "type": "productCategory"  
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
          "created_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00",  
          "document_template": {  
            "type": "documentTemplate",  
            "id": "179e1564-493b-4305-8c54-a34fc80920fc"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "27300f09-6250-4a23-8557-d84c52f99ecf",  
          "department": {  
            "type": "department",  
            "id": "36386b05-936e-4cc0-9523-bd20d797ebf5"  
          },  
          "credit_note_number": "2017/5",  
          "credit_note_date": "2016-02-04",  
          "status": "booked",  
          "invoice": {  
            "type": "invoice",  
            "id": "53484141-8382-4948-9a4c-9cd7e79b30bd"  
          },  
          "paid": true,  
          "paid_at": "2016-03-03T16:44:33+00:00",  
          "invoicee": {  
            "name": "De Rode Duivels",  
            "vat_number": "BE0899623035",  
            "customer": {  
              "type": "contact",  
              "id": "dc2a40bf-f050-4c8e-a002-872a051150b9"  
            },  
            "email": "duivels@test.com",  
            "national_identification_number": "123"  
          },  
          "discounts": [  
            {  
              "type": "percentage",  
              "value": 15.5,  
              "description": "winter promotion"  
            }  
          ],  
          "total": {  
            "tax_exclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "tax_inclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "payable": {  
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
            ]  
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
                  "product_category": {  
                    "id": "e2314517-3cab-4aa9-8471-450e73449041",  
                    "type": "productCategory"  
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
          "created_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00",  
          "document_template": {  
            "type": "documentTemplate",  
            "id": "179e1564-493b-4305-8c54-a34fc80920fc"  
          }  
        }  
      ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/creditNotes.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"27300f09-6250-4a23-8557-d84c52f99ecf\"\n}", null, "application/json");  
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
      "id": "27300f09-6250-4a23-8557-d84c52f99ecf"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
