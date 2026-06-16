# invoices.delete

> Source: https://developer.focus.teamleader.eu/docs/api/invoices-delete

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Invoices](/docs/api/invoices)
  * invoices.delete



# invoices.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/invoices.delete

Delete an existing invoice. Only possible for draft invoices or the last booked invoice.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`7517d21c-75c1-4b89-8956-0e67f46c8532`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/invoices.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"7517d21c-75c1-4b89-8956-0e67f46c8532\"\n}", null, "application/json");  
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
      "id": "7517d21c-75c1-4b89-8956-0e67f46c8532"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
