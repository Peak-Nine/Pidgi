# milestones.open

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-milestones-open

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Milestones](/docs/api/legacy-milestones)
  * milestones.open



# milestones.open
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/milestones.open

(Re)open a milestone. If the milestone's project is closed, the project will be reopened.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`67e80ad8-d14f-4510-a2bd-a4c6aa578c37`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/milestones.open");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"67e80ad8-d14f-4510-a2bd-a4c6aa578c37\"\n}", null, "application/json");  
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
      "id": "67e80ad8-d14f-4510-a2bd-a4c6aa578c37"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
