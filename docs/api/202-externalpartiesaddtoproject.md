# externalParties.addToProject

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-external-parties-add-to-project

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [External parties](/docs/api/external-parties)
  * externalParties.addToProject



# externalParties.addToProject
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/externalParties.addToProject

Add an external party to a project.

## Request​

  * application/json



### Body**required**

**project_id** stringrequired

**Example:**`7257b535-d40f-4699-b3bd-63679379b579`

**customer** objectrequired

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**function** string

**Example:**`Project Manager`

**sub_function** string

**Example:**`Project Coordinator`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/externalParties.addToProject");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"project_id\": \"48ef99b9-4a20-4071-888d-0927f45c03d5\",\n  \"customer\": {\n    \"type\": \"contact\",\n    \"id\": \"adfec6b9-a8d7-403d-bde3-093ad50d74c2\"\n  },\n  \"function\": \"Sales representative\",\n  \"sub_function\": \"Teamleader Focus Sales FR\"\n}", null, "application/json");  
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
      "project_id": "48ef99b9-4a20-4071-888d-0927f45c03d5",
      "customer": {
        "type": "contact",
        "id": "adfec6b9-a8d7-403d-bde3-093ad50d74c2"
      },
      "function": "Sales representative",
      "sub_function": "Teamleader Focus Sales FR"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
