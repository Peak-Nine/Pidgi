# receipts.add

> Source: https://developer.focus.teamleader.eu/docs/api/receipts-add

  * [](/)
  * [API Reference](/docs/api)
  * Expenses
  * [Receipts](/docs/api/receipts)
  * receipts.add



# receipts.add
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/receipts.add

Adds a receipt.

## Request​

  * application/json



### Body

**title** stringrequired

**supplier_id** stringnullable

**document_number** stringnullable

**receipt_date** stringnullable

**currency** objectrequired

**code** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**Example:**`EUR`

**total** object

**tax_inclusive** objectnullable

**amount** numberrequired

**company_entity_id** string

Default company entity will be used if not provided

**file_id** stringnullable




## Responses​

  * 201



Created

**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**type** string

**id** string



    
    
    {  
      "data": {  
        "type": "string",  
        "id": "string"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "receipt",  
        "id": "018d5965-19fb-701a-af11-e80451931551"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/receipts.add");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"title\": \"string\",\n  \"supplier_id\": \"string\",\n  \"document_number\": \"string\",\n  \"receipt_date\": \"string\",\n  \"currency\": {\n    \"code\": \"EUR\"\n  },\n  \"total\": {\n    \"tax_inclusive\": {\n      \"amount\": 0\n    }\n  },\n  \"company_entity_id\": \"string\",\n  \"file_id\": \"string\"\n}", null, "application/json");  
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
      "title": "string",
      "supplier_id": "string",
      "document_number": "string",
      "receipt_date": "string",
      "currency": {
        "code": "EUR"
      },
      "total": {
        "tax_inclusive": {
          "amount": 0
        }
      },
      "company_entity_id": "string",
      "file_id": "string"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
