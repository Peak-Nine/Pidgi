# incomingCreditNotes.registerPayment

> Source: https://developer.focus.teamleader.eu/docs/api/incoming-credit-notes-register-payment

  * [](/)
  * [API Reference](/docs/api)
  * Expenses
  * [Incoming Credit Notes](/docs/api/incoming-credit-notes)
  * incomingCreditNotes.registerPayment



# incomingCreditNotes.registerPayment
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/incomingCreditNotes.registerPayment

Register a payment for an incoming credit note.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**payment** objectrequired

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**paid_at** date-timerequired

**payment_method_id** stringnullable

**remark** stringnullable




## Responses​

  * 201



Created

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
        "id": "88268bc5-86bc-43cb-8c9f-fdcf125e1ad0",  
        "type": "financialTransaction"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/incomingCreditNotes.registerPayment");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"string\",\n  \"payment\": {\n    \"amount\": 123.3,\n    \"currency\": \"BAM\"\n  },\n  \"paid_at\": \"2024-07-29T15:51:28.071Z\",\n  \"payment_method_id\": \"string\",\n  \"remark\": \"string\"\n}", null, "application/json");  
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
      "id": "string",
      "payment": {
        "amount": 123.3,
        "currency": "BAM"
      },
      "paid_at": "2024-07-29T15:51:28.071Z",
      "payment_method_id": "string",
      "remark": "string"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
