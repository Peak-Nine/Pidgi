# creditNotes.list

> Source: https://developer.focus.teamleader.eu/docs/api/credit-notes-list

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Credit Notes](/docs/api/credit-notes)
  * creditNotes.list



# creditNotes.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/creditNotes.list

List credit notes.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**department_id** string

The ID of the department you wish to filter on.

**Example:**`080aac72-ff1a-4627-bfe3-146b6eee979c`

**updated_since** string

**Example:**`2016-02-04T16:44:33+00:00`

**invoice_id** string

**Example:**`60f03745-4289-4ae7-8c74-d797860bc887`

**project_id** string

**Example:**`082e6289-30c5-45ad-bcd0-190b02d21e81`

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**credit_note_date_after** string

This date is inclusive

**Example:**`2022-01-01`

**credit_note_date_before** string

This date is exclusive

**Example:**`2023-01-01`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`




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

**Example:**`2b43633b-22d1-41b6-b87b-e1fd742325d4`

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

**created_at** string

**Example:**`2016-02-04T16:44:33+00:00`

**updated_at** string

**Example:**`2016-02-05T16:44:33+00:00`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "2b43633b-22d1-41b6-b87b-e1fd742325d4",  
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
            ]  
          },  
          "created_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "2b43633b-22d1-41b6-b87b-e1fd742325d4",  
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
            ]  
          },  
          "created_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/creditNotes.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"string\"\n    ],\n    \"department_id\": \"080aac72-ff1a-4627-bfe3-146b6eee979c\",\n    \"updated_since\": \"2016-02-04T16:44:33+00:00\",\n    \"invoice_id\": \"60f03745-4289-4ae7-8c74-d797860bc887\",\n    \"project_id\": \"082e6289-30c5-45ad-bcd0-190b02d21e81\",\n    \"customer\": {\n      \"type\": \"contact\",\n      \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n    },\n    \"credit_note_date_after\": \"2022-01-01\",\n    \"credit_note_date_before\": \"2023-01-01\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
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
    
    
    {
      "filter": {
        "ids": [
          "string"
        ],
        "department_id": "080aac72-ff1a-4627-bfe3-146b6eee979c",
        "updated_since": "2016-02-04T16:44:33+00:00",
        "invoice_id": "60f03745-4289-4ae7-8c74-d797860bc887",
        "project_id": "082e6289-30c5-45ad-bcd0-190b02d21e81",
        "customer": {
          "type": "contact",
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"
        },
        "credit_note_date_after": "2022-01-01",
        "credit_note_date_before": "2023-01-01"
      },
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
