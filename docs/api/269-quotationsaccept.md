# quotations.accept

> Source: https://developer.focus.teamleader.eu/docs/api/quotations-accept

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Quotations](/docs/api/quotations)
  * quotations.accept



# quotations.accept
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/quotations.accept

Mark a quotation as accepted.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`e7a3fe2b-2c75-480f-87b9-121816b5257b`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/quotations.accept");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"e7a3fe2b-2c75-480f-87b9-121816b5257b\"\n}", null, "application/json");  
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
      "id": "e7a3fe2b-2c75-480f-87b9-121816b5257b"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
