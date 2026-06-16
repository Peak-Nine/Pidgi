# invoices.registerPayment

> Source: https://developer.focus.teamleader.eu/docs/api/invoices-register-payment

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Invoices](/docs/api/invoices)
  * invoices.registerPayment



# invoices.registerPayment
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/invoices.registerPayment

Register a payment for an invoice.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`7abb325c-e063-42a4-8fb4-1b730759645a`

**payment** objectrequired

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**paid_at** stringrequired

**Example:**`2016-03-03T16:44:33+00:00`

**payment_method_id** string

**Example:**`bb9589ec-6e08-0d5f-9b23-7be9b9c3ea2d`




## Responses​

  * 204



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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/invoices.registerPayment");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"7abb325c-e063-42a4-8fb4-1b730759645a\",\n  \"payment\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"paid_at\": \"2016-03-03T16:44:33+00:00\",\n  \"payment_method_id\": \"bb9589ec-6e08-0d5f-9b23-7be9b9c3ea2d\"\n}", null, "application/json");  
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
      "id": "7abb325c-e063-42a4-8fb4-1b730759645a",
      "payment": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "paid_at": "2016-03-03T16:44:33+00:00",
      "payment_method_id": "bb9589ec-6e08-0d5f-9b23-7be9b9c3ea2d"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
