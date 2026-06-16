# incomingInvoices.approve

> Source: https://developer.focus.teamleader.eu/docs/api/incoming-invoices-approve

  * [](/)
  * [API Reference](/docs/api)
  * Expenses
  * [Incoming Invoices](/docs/api/incoming-invoices)
  * incomingInvoices.approve



# incomingInvoices.approve
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/incomingInvoices.approve

Approve an incoming invoice.

## Request​

  * application/json



### Body

**id** stringrequired




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/incomingInvoices.approve");  
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
