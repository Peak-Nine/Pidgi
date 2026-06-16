# incomingCreditNotes.info

> Source: https://developer.focus.teamleader.eu/docs/api/incoming-credit-notes-info

  * [](/)
  * [API Reference](/docs/api)
  * Expenses
  * [Incoming Credit Notes](/docs/api/incoming-credit-notes)
  * incomingCreditNotes.info



# incomingCreditNotes.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/incomingCreditNotes.info

Get details for a single incoming credit note.

## Request​

  * application/json



### Body

**id** stringrequired




## Responses​

  * 200



OK

**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**title** string

**origin** object

**type** string

**Possible values:** [`user`, `peppolIncomingDocument`]

**id** string

**supplier** objectnullable

**type** string

**Possible values:** [`company`, `contact`]

**id** string

**document_number** stringnullable

**invoice_date** stringnullable

**due_date** stringnullable

**currency** object

**code** CurrencyCode (string)

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**total** object

**tax_exclusive** objectnullable

**amount** number

**tax_inclusive** objectnullable

**amount** number

**company_entity** object

**type** string

**id** string

**file** objectnullable

**type** string

**id** string

**payment_reference** stringnullable

**review_status** string

**Possible values:** [`pending`, `approved`, `refused`]

**iban_number** stringnullable

**payment_status** string

**Possible values:** [`unknown`, `paid`, `not_paid`]



    
    
    {  
      "data": {  
        "id": "string",  
        "title": "string",  
        "origin": {  
          "type": "user",  
          "id": "string"  
        },  
        "supplier": {  
          "type": "company",  
          "id": "string"  
        },  
        "document_number": "string",  
        "invoice_date": "string",  
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
        "iban_number": "string",  
        "payment_status": "unknown"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "018d5965-19fb-701a-af11-e80451931551",  
        "title": "Incoming credit note",  
        "origin": {  
          "type": "user",  
          "id": "018d5965-19fb-701a-af11-e80451931551"  
        },  
        "supplier": {  
          "type": "company",  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
        },  
        "document_number": "DOC-2032039",  
        "invoice_date": "2024-05-11",  
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
        "payment_reference": "REF-3578296",  
        "review_status": "pending",  
        "iban_number": "BE68539007547034",  
        "payment_status": "not_paid"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/incomingCreditNotes.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"string\"\n}", null, "application/json");  
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
      "id": "string"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
