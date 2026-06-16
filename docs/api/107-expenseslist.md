# expenses.list

> Source: https://developer.focus.teamleader.eu/docs/api/expenses-list

  * [](/)
  * [API Reference](/docs/api)
  * Expenses
  * [Expenses](/docs/api/expenses)
  * expenses.list



# expenses.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/expenses.list

Get a list of all expenses.

## Request​

  * application/json



### Body

**filter** object

**term** string

Filters by document number and supplier name, case-insensitive

**source_types** string[]

Filters by one or more source types

**Possible values:** [`incomingInvoice`, `incomingCreditNote`, `receipt`]

**review_statuses** string[]

Filters by one or more review statuses

**Possible values:** [`pending`, `approved`, `refused`]

**bookkeeping_statuses** string[]

Filters by one or more bookkeeping statuses

**Possible values:** [`sent`, `not_sent`]

**payment_statuses** string[]

Filters by one or more payment statuses

**Possible values:** [`paid`, `unpaid`]

**department_ids** string[]

Filters by one or more department IDs

**supplier** object

Filters by a specific supplier

**type** stringrequired

**Possible values:** [`company`, `contact`]

**id** stringrequired

**document_date** object

**operator** stringrequired

**Possible values:** [`is_empty`, `between`, `equals`, `before`, `after`]

**value** string

Required if operator is `equals`, `before`, or `after`

**start** string

Required if operator is `between`

**end** string

Required if operator is `between`

**paid_at** object

Filters by payment date

**operator** stringrequired

**Possible values:** [`is_empty`, `between`, `equals`, `before`, `after`]

**value** string

Required if operator is `equals`, `before`, or `after`

**start** string

Required if operator is `between`

**end** string

Required if operator is `between`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]




## Responses​

  * 200



OK

**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**source** object

**type** string

**Possible values:** [`incomingInvoice`, `incomingCreditNote`, `receipt`]

**id** string

**origin** object

**type** string

**Possible values:** [`user`, `peppolIncomingDocument`]

**id** string

**title** string

**supplier** objectnullable

**type** string

**Possible values:** [`company`, `contact`]

**id** string

**document_number** stringnullable

**document_date** stringnullable

**due_date** stringnullable

**currency** object

**code** CurrencyCode (string)

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**total** object

**tax_exclusive** objectnullable

**amount** number

**tax_inclusive** objectnullable

**amount** number

**company_entity** objectnullable

**type** string

**id** string

**file** objectnullable

**type** string

**id** string

**payment_reference** stringnullable

**review_status** string

**Possible values:** [`pending`, `approved`, `refused`]

**bookkeeping_status** string

**Possible values:** [`not_sent`, `sent`]

**iban_number** stringnullable

**payment_status** string

**Possible values:** [`unknown`, `paid`, `partially_paid`, `not_paid`]

**paid_amount** numbernullable

**paid_at** stringnullable

  * ]

**meta** object

Only included with request parameter `includes=pagination`

**page** object

**size** number

**Example:**`10`

**number** number

**Example:**`2`

**matches** number

**Example:**`12`



    
    
    {  
      "data": [  
        {  
          "source": {  
            "type": "incomingInvoice",  
            "id": "string"  
          },  
          "origin": {  
            "type": "user",  
            "id": "string"  
          },  
          "title": "string",  
          "supplier": {  
            "type": "company",  
            "id": "string"  
          },  
          "document_number": "string",  
          "document_date": "string",  
          "due_date": "string",  
          "currency": {  
            "code": "BAM"  
          },  
          "total": {  
            "tax_exclusive": {  
              "amount": 0  
            },  
            "tax_inclusive": {  
              "amount": 0  
            }  
          },  
          "company_entity": {  
            "type": "string",  
            "id": "string"  
          },  
          "file": {  
            "type": "string",  
            "id": "string"  
          },  
          "payment_reference": "string",  
          "review_status": "pending",  
          "bookkeeping_status": "not_sent",  
          "iban_number": "string",  
          "payment_status": "unknown",  
          "paid_amount": 0,  
          "paid_at": "string"  
        }  
      ],  
      "meta": {  
        "page": {  
          "size": 10,  
          "number": 2  
        },  
        "matches": 12  
      }  
    }  
    
    
    
    {  
      "data": [  
        {  
          "source": {  
            "type": "incomingInvoice",  
            "id": "018d5965-19fb-701a-af11-e80451931551"  
          },  
          "origin": {  
            "type": "user",  
            "id": "cde0bc5f-8602-4e12-b5d3-f03436b54c0d"  
          },  
          "title": "Cost",  
          "supplier": {  
            "type": "company",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          },  
          "document_number": "DOC-2032039",  
          "document_date": "2024-05-11",  
          "due_date": "2024-06-11",  
          "currency": {  
            "code": "EUR"  
          },  
          "total": {  
            "tax_exclusive": {  
              "amount": 100  
            },  
            "tax_inclusive": {  
              "amount": 100  
            }  
          },  
          "company_entity": {  
            "type": "department",  
            "id": "018fcef1-4f96-7349-9f57-1c7857023c42"  
          },  
          "file": {  
            "type": "file",  
            "id": "5027619a-5e0a-01ce-a533-f80dfcc3f142"  
          },  
          "payment_reference": "PR-12345",  
          "review_status": "pending",  
          "bookkeeping_status": "not_sent",  
          "iban_number": "FR7630006000011234567890189",  
          "payment_status": "paid",  
          "paid_amount": 100,  
          "paid_at": "2025-12-12"  
        }  
      ],  
      "meta": {  
        "page": {  
          "size": 10,  
          "number": 2  
        },  
        "matches": 12  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/expenses.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"term\": \"string\",\n    \"source_types\": [\n      \"incomingInvoice\"\n    ],\n    \"review_statuses\": [\n      \"pending\"\n    ],\n    \"bookkeeping_statuses\": [\n      \"sent\"\n    ],\n    \"payment_statuses\": [\n      \"paid\"\n    ],\n    \"department_ids\": [\n      \"string\"\n    ],\n    \"supplier\": {\n      \"type\": \"company\",\n      \"id\": \"string\"\n    },\n    \"document_date\": {\n      \"operator\": \"is_empty\",\n      \"value\": \"string\",\n      \"start\": \"string\",\n      \"end\": \"string\"\n    },\n    \"paid_at\": {\n      \"operator\": \"is_empty\",\n      \"value\": \"string\",\n      \"start\": \"string\",\n      \"end\": \"string\"\n    }\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"document_date\",\n      \"order\": \"asc\"\n    }\n  ]\n}", null, "application/json");  
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
        "term": "string",
        "source_types": [
          "incomingInvoice"
        ],
        "review_statuses": [
          "pending"
        ],
        "bookkeeping_statuses": [
          "sent"
        ],
        "payment_statuses": [
          "paid"
        ],
        "department_ids": [
          "string"
        ],
        "supplier": {
          "type": "company",
          "id": "string"
        },
        "document_date": {
          "operator": "is_empty",
          "value": "string",
          "start": "string",
          "end": "string"
        },
        "paid_at": {
          "operator": "is_empty",
          "value": "string",
          "start": "string",
          "end": "string"
        }
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "document_date",
          "order": "asc"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
