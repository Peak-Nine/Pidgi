# teams.list

> Source: https://developer.focus.teamleader.eu/docs/api/teams-list

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Teams](/docs/api/teams)
  * teams.list



# teams.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/teams.list

Gets a list of all teams.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**term** string

Filters on name

**Example:**`Designers`

**team_lead_id** string

Filters on teams for which a user is team lead for

**Example:**`6a9106c3-ed2a-46a2-a919-eb3d41165dd2`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`name`]

**Example:**`name`

**order** Order (string)

**Possible values:** [`asc`, `desc`]

  * ]




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

**Example:**`4b5291aa-2d78-09d2-882c-6c1483f00d88`

**name** string

**Example:**`Designers`

**team_lead** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**members** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "4b5291aa-2d78-09d2-882c-6c1483f00d88",  
          "name": "Designers",  
          "team_lead": {  
            "type": "user",  
            "id": "bef8c53b-b6bc-0fde-944e-5c4b16e5155a"  
          },  
          "members": [  
            {  
              "type": "user",  
              "id": "bef8c53b-b6bc-0fde-944e-5c4b16e5155a"  
            }  
          ]  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "4b5291aa-2d78-09d2-882c-6c1483f00d88",  
          "name": "Designers",  
          "team_lead": {  
            "type": "user",  
            "id": "bef8c53b-b6bc-0fde-944e-5c4b16e5155a"  
          },  
          "members": [  
            {  
              "type": "user",  
              "id": "bef8c53b-b6bc-0fde-944e-5c4b16e5155a"  
            }  
          ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/teams.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"92296ad0-2d61-4179-b174-9f354ca2157f\",\n      \"53635682-c382-4fbf-9fd9-9506ca4fbcdd\"\n    ],\n    \"term\": \"Designers\",\n    \"team_lead_id\": \"6a9106c3-ed2a-46a2-a919-eb3d41165dd2\"\n  },\n  \"sort\": [\n    {\n      \"field\": \"name\"\n    }\n  ]\n}", null, "application/json");  
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
          "92296ad0-2d61-4179-b174-9f354ca2157f",
          "53635682-c382-4fbf-9fd9-9506ca4fbcdd"
        ],
        "term": "Designers",
        "team_lead_id": "6a9106c3-ed2a-46a2-a919-eb3d41165dd2"
      },
      "sort": [
        {
          "field": "name"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
