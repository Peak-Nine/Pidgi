# projects.removeCustomer

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-remove-customer

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Projects](/docs/api/projects)
  * projects.removeCustomer



# projects.removeCustomer
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projects.removeCustomer

Remove a customer from the project. Doesn't fail if the customer was not added.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`0184f276-811b-716d-8b79-17628c9573c6`

**customer** objectrequired

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projects.removeCustomer");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"0184f276-811b-716d-8b79-17628c9573c6\",\n  \"customer\": {\n    \"type\": \"contact\",\n    \"id\": \"03148b5d-4cb0-4750-a3f2-8697cf8bce10\"\n  }\n}", null, "application/json");  
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
      "id": "0184f276-811b-716d-8b79-17628c9573c6",
      "customer": {
        "type": "contact",
        "id": "03148b5d-4cb0-4750-a3f2-8697cf8bce10"
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
