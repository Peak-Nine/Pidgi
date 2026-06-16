# incomingInvoices.removePayment

> Source: https://developer.focus.teamleader.eu/docs/api/incoming-invoices-remove-payment

  * [](/)
  * [API Reference](/docs/api)
  * Expenses
  * [Incoming Invoices](/docs/api/incoming-invoices)
  * incomingInvoices.removePayment



# incomingInvoices.removePayment
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/incomingInvoices.removePayment

Remove a payment from an incoming invoice.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**payment_id** stringrequired




## Responses​

  * 204



No Content

  * application/json



  * Schema



**Schema**




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/incomingInvoices.removePayment");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"string\",\n  \"payment_id\": \"string\"\n}", null, "application/json");  
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
      "payment_id": "string"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
