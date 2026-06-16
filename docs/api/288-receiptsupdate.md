# receipts.update

> Source: https://developer.focus.teamleader.eu/docs/api/receipts-update

  * [](/)
  * [API Reference](/docs/api)
  * Expenses
  * [Receipts](/docs/api/receipts)
  * receipts.update



# receipts.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/receipts.update

Updates a receipt.

## Request​

  * application/json



### Body

**id** stringrequired

**title** string

**supplier_id** stringnullable

**document_number** stringnullable

**receipt_date** stringnullable

**currency** object

**code** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**Example:**`EUR`

**total** object

**tax_inclusive** objectnullable

**amount** numberrequired

**company_entity_id** string

**file_id** stringnullable




## Responses​

  * 204



No Content

**Response Headers**




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/receipts.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"string\",\n  \"title\": \"string\",\n  \"supplier_id\": \"string\",\n  \"document_number\": \"string\",\n  \"receipt_date\": \"string\",\n  \"currency\": {\n    \"code\": \"EUR\"\n  },\n  \"total\": {\n    \"tax_inclusive\": {\n      \"amount\": 0\n    }\n  },\n  \"company_entity_id\": \"string\",\n  \"file_id\": \"string\"\n}", null, "application/json");  
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
      "id": "string",
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
