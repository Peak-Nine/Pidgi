# projects.updateParticipant

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-projects-update-participant

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Projects](/docs/api/legacy-projects)
  * projects.updateParticipant



# projects.updateParticipant
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects.updateParticipant

Update a participant's role for a project.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`55fbe14f-7399-48e5-b4e0-64b7f5c50451`

**participant** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**role** Role (string)required

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects.updateParticipant");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"55fbe14f-7399-48e5-b4e0-64b7f5c50451\",\n  \"participant\": {\n    \"type\": \"user\",\n    \"id\": \"5ccbc008-f65e-4192-836c-4d7e21f54052\"\n  },\n  \"role\": \"decision_maker\"\n}", null, "application/json");  
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
      "id": "55fbe14f-7399-48e5-b4e0-64b7f5c50451",
      "participant": {
        "type": "user",
        "id": "5ccbc008-f65e-4192-836c-4d7e21f54052"
      },
      "role": "decision_maker"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
