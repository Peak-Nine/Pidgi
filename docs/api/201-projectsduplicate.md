# projects.duplicate

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-duplicate

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Projects](/docs/api/projects)
  * projects.duplicate



# projects.duplicate
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projects.duplicate

Duplicate a project.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`81df9996-6d2c-4844-86d6-202c08d2837e`

**title** stringrequired

**Example:**`Copy of my project`




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
        "type": "nextgenProject",  
        "id": "49b403be-a32e-0901-9b1c-25214f9027c6"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "nextgenProject",  
        "id": "49b403be-a32e-0901-9b1c-25214f9027c6"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projects.duplicate");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"81df9996-6d2c-4844-86d6-202c08d2837e\",\n  \"title\": \"Copy of my project\"\n}", null, "application/json");  
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
      "id": "81df9996-6d2c-4844-86d6-202c08d2837e",
      "title": "Copy of my project"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
