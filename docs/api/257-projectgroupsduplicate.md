# projectGroups.duplicate

> Source: https://developer.focus.teamleader.eu/docs/api/project-groups-duplicate

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Groups](/docs/api/groups)
  * projectGroups.duplicate



# projectGroups.duplicate
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projectGroups.duplicate

Duplicate a group and its entities, without any time trackings.

## Request​

  * application/json



### Body**required**

**origin_id** stringrequired

The id of the group that is being duplicated

**Example:**`0186a6b5-2fdc-749a-983a-c4a1303546d7`




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
        "type": "nextgenProjectGroup",  
        "id": "0186a6b5-682c-7b0e-95c9-090627a73d3b"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "nextgenProjectGroup",  
        "id": "0186a6b5-682c-7b0e-95c9-090627a73d3b"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projectGroups.duplicate");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"origin_id\": \"0186a6b5-2fdc-749a-983a-c4a1303546d7\"\n}", null, "application/json");  
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
      "origin_id": "0186a6b5-2fdc-749a-983a-c4a1303546d7"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
