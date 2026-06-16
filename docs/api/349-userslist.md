# users.list

> Source: https://developer.focus.teamleader.eu/docs/api/users-list

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Users](/docs/api/users)
  * users.list



# users.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/users.list

Get a list of all users.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**term** string

Filters on first name, last name, email and function

**Example:**`John`

**status** string[]

Filters on status:

    * `active` \- Filters on active users
    * `deactivated` \- Filters on deactivated users

**Possible values:** [`active`, `deactivated`]

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`first_name`, `last_name`, `email`, `function`]

**order** Order (string)

**Possible values:** [`asc`, `desc`]

  * ]

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

**Example:**`cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5`

**account** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`account`

**first_name** string

**Example:**`John`

**last_name** string

**Example:**`Smith`

**email** string

**Example:**`john@teamleader.eu`

**telephones** object[]

  * Array [

**type** string

**Possible values:** [`phone`, `mobile`, `fax`]

**Example:**`phone`

**number** string

**Example:**`092980615`

  * ]

**language** string

**Example:**`nl`

**function** string

**Example:**`Sales`

**status** string

**Possible values:** [`active`, `deactivated`]

**Example:**`active`

**teams** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`team`

  * ]

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",  
          "account": {  
            "type": "account",  
            "id": "0fc55513-7f68-4865-aba0-de5da9e4e43d"  
          },  
          "first_name": "John",  
          "last_name": "Smith",  
          "email": "john@teamleader.eu",  
          "telephones": [  
            {  
              "type": "phone",  
              "number": "092980615"  
            }  
          ],  
          "language": "nl",  
          "function": "Sales",  
          "status": "active",  
          "teams": [  
            {  
              "type": "team",  
              "id": "6dd0069e-45da-0ec4-911a-afb351d968cd"  
            }  
          ]  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",  
          "account": {  
            "type": "account",  
            "id": "0fc55513-7f68-4865-aba0-de5da9e4e43d"  
          },  
          "first_name": "John",  
          "last_name": "Smith",  
          "email": "john@teamleader.eu",  
          "telephones": [  
            {  
              "type": "phone",  
              "number": "092980615"  
            }  
          ],  
          "language": "nl",  
          "function": "Sales",  
          "status": "active",  
          "teams": [  
            {  
              "type": "team",  
              "id": "6dd0069e-45da-0ec4-911a-afb351d968cd"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/users.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5\",\n      \"f8a57a6f-dd1e-41a3-b8d3-428663f1d09e\"\n    ],\n    \"term\": \"John\",\n    \"status\": [\n      \"active\",\n      \"deactivated\"\n    ]\n  },\n  \"sort\": [\n    {\n      \"field\": \"first_name\"\n    }\n  ],\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
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
          "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",
          "f8a57a6f-dd1e-41a3-b8d3-428663f1d09e"
        ],
        "term": "John",
        "status": [
          "active",
          "deactivated"
        ]
      },
      "sort": [
        {
          "field": "first_name"
        }
      ],
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
