# materials.assign

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-materials-assign

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Materials](/docs/api/materials)
  * materials.assign



# materials.assign
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/materials.assign

Assign a user or a team to a material.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`0184f276-811b-716d-8b79-17628c9573c6`

**assignee** objectrequired

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/materials.assign");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"0184f276-811b-716d-8b79-17628c9573c6\",\n  \"assignee\": {\n    \"type\": \"user\",\n    \"id\": \"66abace2-62af-0836-a927-fe3f44b9b47b\"\n  }\n}", null, "application/json");  
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
      "assignee": {
        "type": "user",
        "id": "66abace2-62af-0836-a927-fe3f44b9b47b"
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
