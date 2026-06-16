# levelTwoAreas.list

> Source: https://developer.focus.teamleader.eu/docs/api/level-two-areas-list

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Addresses](/docs/api/addresses)
  * levelTwoAreas.list



# levelTwoAreas.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/levelTwoAreas.list

Get a list of level two areas (which correspond to provinces, departments or states in most countries).

## Request​

  * application/json



### Body**required**

**country** stringrequired

**Example:**`BE`

**language** string

if not passed, the name is returned in the primary language of the country

**Example:**`nl`




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

**Example:**`fd48d4a3-b9dc-4eac-8071-5889c9f21e5d`

**name** string

**Example:**`VZW/ASBL`

**country** string

**Example:**`BE`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "fd48d4a3-b9dc-4eac-8071-5889c9f21e5d",  
          "name": "West-Vlaanderen",  
          "country": "BE"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "fd48d4a3-b9dc-4eac-8071-5889c9f21e5d",  
          "name": "West-Vlaanderen",  
          "country": "BE"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/levelTwoAreas.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"country\": \"BE\",\n  \"language\": \"nl\"\n}", null, "application/json");  
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
      "country": "BE",
      "language": "nl"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
