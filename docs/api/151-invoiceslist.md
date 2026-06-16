# invoices.list

> Source: https://developer.focus.teamleader.eu/docs/api/invoices-list

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Invoices](/docs/api/invoices)
  * invoices.list



# invoices.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/invoices.list

Get a list of invoices.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**term** string

Filters on invoice number, purchase order number, payment reference and invoicee

**Example:**`Interesting invoice`

**invoice_number** string

Filters on a full invoice number (fiscal year / number)

**Example:**`2017 / 5`

**department_id** string

Filters on a department (company entity)

**Example:**`af48fe9e-d44c-0eac-8813-8be051b10921`

**deal_id** string

Filters on a deal

**Example:**`4a219dae-7b80-4c79-97d2-bdadbab299ba`

**project_id** string

Filters on a project

**Example:**`ba7d9731-c7d0-43d3-af95-fd7b3e818dbc`

**subscription_id** string

Filters on a subscription

**Example:**`8631bbbf-bead-4f6e-a2ab-58ec9bbd997a`

**status** string[]

The statuses you want to filter by.

**Possible values:** [`draft`, `outstanding`, `matched`]

**updated_since** string

**Example:**`2016-02-04T16:44:33+00:00`

**purchase_order_number** string

**Example:**`000023`

**payment_reference** string

**Example:**`+++084/2613/66074+++`

**invoice_date_after** string

This date is inclusive

**Example:**`2020-01-01`

**invoice_date_before** string

This date is inclusive

**Example:**`2022-01-01`

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`invoice_number`, `invoice_date`]

**Default value:**`invoice_number`

**order** Order (string)

**Possible values:** [`asc`, `desc`]

**Default value:**`desc`

  * ]

**includes** string

when used, the response will include `totals.due_incasso_inclusive`, `totals.fixed_late_fee` and `totals.interest`

**Example:**`late_fees`




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

**Example:**`2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4`

**department** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**invoice_number** stringnullable

**Example:**`2017 / 5`

**invoice_date** stringnullable

**Example:**`2016-02-04`

**status** string

**Possible values:** [`draft`, `outstanding`, `matched`]

**Example:**`matched`

**due_on** stringnullable

**Example:**`2016-03-03`

**paid** boolean

**Example:**`true`

**paid_at** stringnullable

**Example:**`2016-02-04T16:44:33+00:00`

**sent** boolean

**Example:**`true`

**purchase_order_number** stringnullable

**Example:**`000023`

**payment_reference** stringnullable

**Example:**`+++084/2613/66074+++`

**invoicee** object

**name** string

**Example:**`De Rode Duivels`

**vat_number** stringnullable

**Example:**`BE0899623035`

**customer** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**for_attention_of** objectnullable

**name** stringnullable

**Example:**`Radja Nainggolan`

**contact** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

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

**due** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**due_incasso_inclusive** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**fixed_late_fee** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**interest** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

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

**web_url** string

**Example:**`https://focus.teamleader.eu/invoice_detail.php?id=2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4`

**file** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**deal** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**project** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**subscription** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**delivery_date** stringnullable

**Example:**`2025-12-08`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4",  
          "department": {  
            "type": "department",  
            "id": "5e90eb0a-b502-4344-aa0f-3b8525af6186"  
          },  
          "invoice_number": "2017 / 5",  
          "invoice_date": "2016-02-04",  
          "status": "matched",  
          "due_on": "2016-03-03",  
          "paid": true,  
          "paid_at": "2016-02-04T16:44:33+00:00",  
          "sent": true,  
          "purchase_order_number": "000023",  
          "payment_reference": "+++084/2613/66074+++",  
          "invoicee": {  
            "name": "De Rode Duivels",  
            "vat_number": "BE0899623035",  
            "customer": {  
              "type": "contact",  
              "id": "4b0f959a-27e3-4080-b1b2-a05b374863cb"  
            },  
            "for_attention_of": {  
              "name": "Radja Nainggolan",  
              "contact": {  
                "type": "contact",  
                "id": "d4391f46-a32c-458c-b2ee-833fd27a348d"  
              }  
            }  
          },  
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
            ],  
            "due": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "due_incasso_inclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "fixed_late_fee": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "interest": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          },  
          "currency_exchange_rate": {  
            "from": "USD",  
            "to": "EUR",  
            "rate": 1.1234  
          },  
          "created_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00",  
          "web_url": "https://focus.teamleader.eu/invoice_detail.php?id=2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4",  
          "file": {  
            "type": "file",  
            "id": "39a02b79-b9a9-46e3-a44d-6c473b2fe350"  
          },  
          "deal": {  
            "type": "deal",  
            "id": "a8ef428a-0e70-48a5-8696-58be0c45a772"  
          },  
          "project": {  
            "type": "project",  
            "id": "179e1564-493b-4305-8c54-a34fc80920fc"  
          },  
          "subscription": {  
            "type": "subscription",  
            "id": "8631bbbf-bead-4f6e-a2ab-58ec9bbd997a"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4",  
          "department": {  
            "type": "department",  
            "id": "5e90eb0a-b502-4344-aa0f-3b8525af6186"  
          },  
          "invoice_number": "2017 / 5",  
          "invoice_date": "2016-02-04",  
          "status": "matched",  
          "due_on": "2016-03-03",  
          "paid": true,  
          "paid_at": "2016-02-04T16:44:33+00:00",  
          "sent": true,  
          "purchase_order_number": "000023",  
          "payment_reference": "+++084/2613/66074+++",  
          "invoicee": {  
            "name": "De Rode Duivels",  
            "vat_number": "BE0899623035",  
            "customer": {  
              "type": "contact",  
              "id": "4b0f959a-27e3-4080-b1b2-a05b374863cb"  
            },  
            "for_attention_of": {  
              "name": "Radja Nainggolan",  
              "contact": {  
                "type": "contact",  
                "id": "d4391f46-a32c-458c-b2ee-833fd27a348d"  
              }  
            }  
          },  
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
            ],  
            "due": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "due_incasso_inclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "fixed_late_fee": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "interest": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          },  
          "currency_exchange_rate": {  
            "from": "USD",  
            "to": "EUR",  
            "rate": 1.1234  
          },  
          "created_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00",  
          "web_url": "https://focus.teamleader.eu/invoice_detail.php?id=2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4",  
          "file": {  
            "type": "file",  
            "id": "39a02b79-b9a9-46e3-a44d-6c473b2fe350"  
          },  
          "deal": {  
            "type": "deal",  
            "id": "a8ef428a-0e70-48a5-8696-58be0c45a772"  
          },  
          "project": {  
            "type": "project",  
            "id": "179e1564-493b-4305-8c54-a34fc80920fc"  
          },  
          "subscription": {  
            "type": "subscription",  
            "id": "8631bbbf-bead-4f6e-a2ab-58ec9bbd997a"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/invoices.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5\",\n      \"f8a57a6f-dd1e-41a3-b8d3-428663f1d09e\"\n    ],\n    \"term\": \"Interesting invoice\",\n    \"invoice_number\": \"2017 / 5\",\n    \"department_id\": \"af48fe9e-d44c-0eac-8813-8be051b10921\",\n    \"deal_id\": \"4a219dae-7b80-4c79-97d2-bdadbab299ba\",\n    \"project_id\": \"ba7d9731-c7d0-43d3-af95-fd7b3e818dbc\",\n    \"subscription_id\": \"8631bbbf-bead-4f6e-a2ab-58ec9bbd997a\",\n    \"status\": [\n      \"draft\",\n      \"outstanding\",\n      \"matched\"\n    ],\n    \"updated_since\": \"2016-02-04T16:44:33+00:00\",\n    \"purchase_order_number\": \"000023\",\n    \"payment_reference\": \"+++084/2613/66074+++\",\n    \"invoice_date_after\": \"2020-01-01\",\n    \"invoice_date_before\": \"2022-01-01\",\n    \"customer\": {\n      \"type\": \"company\",\n      \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n    }\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"invoice_number\"\n    }\n  ],\n  \"includes\": \"late_fees\"\n}", null, "application/json");  
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

Body

  * Example (from schema)
  * Example


    
    
    {
      "filter": {
        "ids": [
          "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",
          "f8a57a6f-dd1e-41a3-b8d3-428663f1d09e"
        ],
        "term": "Interesting invoice",
        "invoice_number": "2017 / 5",
        "department_id": "af48fe9e-d44c-0eac-8813-8be051b10921",
        "deal_id": "4a219dae-7b80-4c79-97d2-bdadbab299ba",
        "project_id": "ba7d9731-c7d0-43d3-af95-fd7b3e818dbc",
        "subscription_id": "8631bbbf-bead-4f6e-a2ab-58ec9bbd997a",
        "status": [
          "draft",
          "outstanding",
          "matched"
        ],
        "updated_since": "2016-02-04T16:44:33+00:00",
        "purchase_order_number": "000023",
        "payment_reference": "+++084/2613/66074+++",
        "invoice_date_after": "2020-01-01",
        "invoice_date_before": "2022-01-01",
        "customer": {
          "type": "company",
          "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
        }
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "invoice_number"
        }
      ],
      "includes": "late_fees"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
