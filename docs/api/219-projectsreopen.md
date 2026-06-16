# projects.reopen

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-reopen

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Projects](/docs/api/projects)
  * projects.reopen



# projects.reopen
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projects.reopen

Reopen a closed project.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`01548b10-4932-4a18-8a89-005ad09db2c8`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projects.reopen");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"0184f276-811b-716d-8b79-17628c9573c6\"\n}", null, "application/json");  
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
      "id": "0184f276-811b-716d-8b79-17628c9573c6"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
