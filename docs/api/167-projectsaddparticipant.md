# projects.addParticipant

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-projects-add-participant

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Projects](/docs/api/legacy-projects)
  * projects.addParticipant



# projects.addParticipant
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects.addParticipant

Add a participant to a project.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`8dbfa9db-c53f-410c-97d3-755b19685809`

**participant** objectrequired

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**role** Role (string)

**Possible values:** [`decision_maker`, `member`]




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects.addParticipant");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"8dbfa9db-c53f-410c-97d3-755b19685809\",\n  \"participant\": {\n    \"type\": \"user\",\n    \"id\": \"a1388f3d-6116-4792-ac1c-04657697539e\"\n  },\n  \"role\": \"member\"\n}", null, "application/json");  
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
      "id": "8dbfa9db-c53f-410c-97d3-755b19685809",
      "participant": {
        "type": "user",
        "id": "a1388f3d-6116-4792-ac1c-04657697539e"
      },
      "role": "member"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
