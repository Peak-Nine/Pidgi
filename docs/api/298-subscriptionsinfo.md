# subscriptions.info

> Source: https://developer.focus.teamleader.eu/docs/api/subscriptions-info

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Subscriptions](/docs/api/subscriptions)
  * subscriptions.info



# subscriptions.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/subscriptions.info

Get details for a single subscription.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`e2314517-3cab-4aa9-8471-450e73449041`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)



**Schema**

**data** object

**id** string

**Example:**`e2314517-3cab-4aa9-8471-450e73449041`

**title** string

**Example:**`Subscription for cookies`

**note** stringnullable

Uses Markdown formatting

**Example:**`Some more **information** about this subscription`

**status** string

**Possible values:** [`active`, `deactivated`]

**Example:**`active`

**department** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**invoicee** object

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**for_attention_of** objectnullable

**name** stringnullable

**Example:**`Radja Nainggolan`

**contact** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**project** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**next_renewal_date** stringnullable

**Example:**`2022-06-21`

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

**web_url** string

**Example:**`https://focus.teamleader.eu/subscription_detail.php?id=e2314517-3cab-4aa9-8471-450e73449041`

**starts_on** string

**Example:**`2022-05-21`

**ends_on** stringnullable

**Example:**`2023-07-21`

**billing_cycle** object

Only available for api-version 9999-99-99

**periodicity** object

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

**days_in_advance** integer

**Possible values:** [`0`, `7`, `14`, `21`, `28`]

**Example:**`7`

**payment_term** object

**type** string

**Possible values:** [`cash`, `end_of_month`, `after_invoice_date`]

**days** number

Modifier "X" for the above statements. Not required when type is 'cash'.

**grouped_lines** object[]

  * Array [

**section** object

**title** stringnullable

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

**extended_description** stringnullable

Uses Markdown formatting

**Example:**`Some more information about this awesome product`

**unit** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**unit_price** object

**amount** numberrequired

**Example:**`123.3`

**tax** stringrequired

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

**withheld_tax** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

  * ]

**invoice_generation** object

**action** string

**Possible values:** [`draft`, `book`, `book_and_send`]

**Example:**`book`

**sending_methods** object[]

Only provided when action is "book and send".

  * Array [

**method** string

**Possible values:** [`email`, `peppol`, `postal_service`]

**Example:**`email`

  * ]

**payment_method** string

**Possible values:** [`direct_debit`]

**custom_fields** object[]

  * Array [

**definition** object

**type** string

**Example:**`customFieldDefinition`

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * numbers
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

For multiple selection fields

**Example:**`foo`

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

For related Teamleader objects

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

**document_template** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**currency** string

**Example:**`USD`

**created_at** stringnullable

**Example:**`2022-04-18T16:44:33+00:00`



    
    
    {  
      "data": {  
        "id": "e2314517-3cab-4aa9-8471-450e73449041",  
        "title": "Subscription for cookies",  
        "note": "Some more **information** about this subscription",  
        "status": "active",  
        "department": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "string"  
        },  
        "invoicee": {  
          "customer": {  
            "type": "contact",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          },  
          "for_attention_of": {  
            "name": "Radja Nainggolan",  
            "contact": {  
              "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
              "type": "string"  
            }  
          }  
        },  
        "project": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "string"  
        },  
        "next_renewal_date": "2022-06-21",  
        "total": {  
          "tax_exclusive": {  
            "amount": 123.3,  
            "currency": "BAM"  
          },  
          "tax_inclusive": {  
            "amount": 123.3,  
            "currency": "BAM"  
          },  
          "taxes": [  
            {  
              "rate": 0.21,  
              "taxable": {  
                "amount": 123.3,  
                "currency": "BAM"  
              },  
              "tax": {  
                "amount": 123.3,  
                "currency": "BAM"  
              }  
            }  
          ]  
        },  
        "web_url": "https://focus.teamleader.eu/subscription_detail.php?id=e2314517-3cab-4aa9-8471-450e73449041",  
        "starts_on": "2022-05-21",  
        "ends_on": "2023-07-21",  
        "billing_cycle": {  
          "periodicity": {  
            "unit": "week",  
            "period": 2  
          },  
          "days_in_advance": 7  
        },  
        "payment_term": {  
          "type": "cash",  
          "days": 0  
        },  
        "grouped_lines": [  
          {  
            "section": {  
              "title": "string"  
            },  
            "line_items": [  
              {  
                "product": {  
                  "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
                  "type": "string"  
                },  
                "quantity": 3,  
                "description": "An awesome product",  
                "extended_description": "Some more information about this awesome product",  
                "unit": {  
                  "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
                  "type": "string"  
                },  
                "unit_price": {  
                  "amount": 123.3,  
                  "tax": "excluding"  
                },  
                "tax": {  
                  "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
                  "type": "string"  
                },  
                "discount": {  
                  "value": 10,  
                  "type": "percentage"  
                },  
                "total": {  
                  "tax_exclusive": {  
                    "amount": 123.3,  
                    "currency": "BAM"  
                  },  
                  "tax_exclusive_before_discount": {  
                    "amount": 123.3,  
                    "currency": "BAM"  
                  },  
                  "tax_inclusive": {  
                    "amount": 123.3,  
                    "currency": "BAM"  
                  },  
                  "tax_inclusive_before_discount": {  
                    "amount": 123.3,  
                    "currency": "BAM"  
                  }  
                },  
                "product_category": {  
                  "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
                  "type": "string"  
                },  
                "withheld_tax": {  
                  "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
                  "type": "string"  
                }  
              }  
            ]  
          }  
        ],  
        "invoice_generation": {  
          "action": "book",  
          "sending_methods": [  
            {  
              "method": "email"  
            }  
          ],  
          "payment_method": "direct_debit"  
        },  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "document_template": {  
          "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
          "type": "string"  
        },  
        "currency": "USD",  
        "created_at": "2022-04-18T16:44:33+00:00"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/subscriptions.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"e2314517-3cab-4aa9-8471-450e73449041\"\n}", null, "application/json");  
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
      "id": "e2314517-3cab-4aa9-8471-450e73449041"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
