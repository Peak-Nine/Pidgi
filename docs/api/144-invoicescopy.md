# invoices.copy

> Source: https://developer.focus.teamleader.eu/docs/api/invoices-copy

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Invoices](/docs/api/invoices)
  * invoices.copy



# invoices.copy
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/invoices.copy

Creates a new draft invoice based on another invoice.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`b7023c11-455e-4fa5-bb96-87f37dbc7d07`




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "invoice",  
        "id": "e4bf74ca-e900-471f-84b1-276e5d3afae4"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "invoice",  
        "id": "e4bf74ca-e900-471f-84b1-276e5d3afae4"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/invoices.copy");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"b7023c11-455e-4fa5-bb96-87f37dbc7d07\"\n}", null, "application/json");  
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
      "id": "b7023c11-455e-4fa5-bb96-87f37dbc7d07"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
