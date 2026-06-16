# accounts.projects-v2-status

> Source: https://developer.focus.teamleader.eu/docs/api/accounts-projects-v-2-status

  * [](/)
  * [API Reference](/docs/api)
  * Other
  * [Accounts](/docs/api/accounts)
  * accounts.projects-v2-status



# accounts.projects-v2-status
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/accounts.projects-v2-status

Fetch which version of Projects the account is using.

## Request​

### Header Parameters

**Content-Type** stringrequired

**Possible values:** [`application/json`]




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**status** string

**Possible values:** [`projects-v2`, `legacy`]

**Example:**`projects-v2`

**will_be_automatically_switched_on** string

Date when the account will be automatically switched to `projects-v2` version (optional).

**Example:**`2024-12-31`



    
    
    {  
      "data": {  
        "status": "projects-v2",  
        "will_be_automatically_switched_on": "2024-12-31"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "status": "projects-v2",  
        "will_be_automatically_switched_on": "2024-12-31"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/accounts.projects-v2-status");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Parameters

Content-Type — headerrequired

\---application/json

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
