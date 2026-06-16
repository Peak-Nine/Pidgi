# activityTypes.list

> Source: https://developer.focus.teamleader.eu/docs/api/activity-types-list

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Activity Types](/docs/api/activity-types)
  * activityTypes.list



# activityTypes.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/activityTypes.list

Get a list of all activity types.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

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
          "id": "9feb5f61-c6dd-4f9d-9b37-2813ada4e343",  
          "name": ""  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "9feb5f61-c6dd-4f9d-9b37-2813ada4e343",  
          "name": ""  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/activityTypes.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"7fcf5609-25fe-47e2-97b2-dbd9c817796e\",\n      \"366b6100-7005-4b1b-a16a-7e88f445f496\"\n    ]\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
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

Body

  * Example (from schema)
  * Example


    
    
    {
      "filter": {
        "ids": [
          "7fcf5609-25fe-47e2-97b2-dbd9c817796e",
          "366b6100-7005-4b1b-a16a-7e88f445f496"
        ]
      },
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
