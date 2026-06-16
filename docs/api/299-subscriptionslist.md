# subscriptions.list

> Source: https://developer.focus.teamleader.eu/docs/api/subscriptions-list

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Subscriptions](/docs/api/subscriptions)
  * subscriptions.list



# subscriptions.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/subscriptions.list

Get a list of subscriptions.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**invoice_id** string

Find subscriptions that generated the given invoice

**Example:**`60f03745-4289-4ae7-8c74-d797860bc887`

**deal_id** string

Filter on subscriptions created from a deal

**Example:**`fddf42f9-bda1-0c49-a22b-0bf147cd1e3f`

**department_id** string

Filter on subscriptions of a specific department (company entity)

**Example:**`af48fe9e-d44c-0eac-8813-8be051b10921`

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**status** string[]

Filters on status:

    * `active` \- Filters on active subscriptions
    * `deactivated` \- Filters on deactivated subscriptions

**Possible values:** [`active`, `deactivated`]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`title`, `created_at`, `status`]

**order** Order (string)

**Possible values:** [`asc`, `desc`]

  * ]




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)



**Schema**

**data** object[]

  * Array [

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

**starts_on** string

**Example:**`2022-05-21`

**ends_on** stringnullable

**Example:**`2023-07-21`

**next_renewal_date** stringnullable

**Example:**`2022-06-21`

**billing_cycle** object

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

**created_at** stringnullable

**Example:**`2022-04-18T16:44:33+00:00`

  * ]



    
    
    {  
      "data": [  
        {  
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
          "starts_on": "2022-05-21",  
          "ends_on": "2023-07-21",  
          "next_renewal_date": "2022-06-21",  
          "billing_cycle": {  
            "periodicity": {  
              "unit": "week",  
              "period": 2  
            },  
            "days_in_advance": 7  
          },  
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
          "created_at": "2022-04-18T16:44:33+00:00"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/subscriptions.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"46156648-87c6-478d-8aa7-1dc3a00dacab\",\n      \"46156648-87c6-478d-8aa7-1dc3a00daca4\"\n    ],\n    \"invoice_id\": \"60f03745-4289-4ae7-8c74-d797860bc887\",\n    \"deal_id\": \"fddf42f9-bda1-0c49-a22b-0bf147cd1e3f\",\n    \"department_id\": \"af48fe9e-d44c-0eac-8813-8be051b10921\",\n    \"customer\": {\n      \"type\": \"contact\",\n      \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n    },\n    \"status\": [\n      \"active\",\n      \"deactivated\"\n    ]\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"title\"\n    }\n  ]\n}", null, "application/json");  
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
          "46156648-87c6-478d-8aa7-1dc3a00dacab",
          "46156648-87c6-478d-8aa7-1dc3a00daca4"
        ],
        "invoice_id": "60f03745-4289-4ae7-8c74-d797860bc887",
        "deal_id": "fddf42f9-bda1-0c49-a22b-0bf147cd1e3f",
        "department_id": "af48fe9e-d44c-0eac-8813-8be051b10921",
        "customer": {
          "type": "contact",
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"
        },
        "status": [
          "active",
          "deactivated"
        ]
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "title"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
