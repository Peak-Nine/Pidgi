# callOutcomes.list

> Source: https://developer.focus.teamleader.eu/docs/api/call-outcomes-list

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Call Outcomes](/docs/api/call-outcomes)
  * callOutcomes.list



# callOutcomes.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/callOutcomes.list

Get a list of call outcomes.

## Request​

### Header Parameters

**Content-Type** stringrequired

**Possible values:** [`application/json`]




  * application/json



### Body

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`




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
          "id": "2b43633b-22d1-41b6-b87b-e1fd742325d4",  
          "name": "Foo Bar"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "2b43633b-22d1-41b6-b87b-e1fd742325d4",  
          "name": "Foo Bar"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/callOutcomes.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
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

Parameters

Content-Type — headerrequired

\---application/json

Body
    
    
    {
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
