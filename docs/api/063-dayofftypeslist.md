# dayOffTypes.list

> Source: https://developer.focus.teamleader.eu/docs/api/day-off-types-list

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Day Off Types](/docs/api/day-off-types)
  * dayOffTypes.list



# dayOffTypes.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dayOffTypes.list

Returns a list of day off types for the account

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

**data** object[]

  * Array [

**id** string

**Example:**`811a5825-96f4-4318-83c3-2840935c6003`

**name** string

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "39263c14-9c16-022d-8513-60cf722ab088",  
          "name": "Sick leave"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "39263c14-9c16-022d-8513-60cf722ab088",  
          "name": "Sick leave"  
        }  
      ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dayOffTypes.list");  
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
