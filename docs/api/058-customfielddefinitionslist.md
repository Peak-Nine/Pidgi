# customFieldDefinitions.list

> Source: https://developer.focus.teamleader.eu/docs/api/custom-field-definitions-list

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Custom Fields](/docs/api/custom-fields)
  * customFieldDefinitions.list



# customFieldDefinitions.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/customFieldDefinitions.list

Get a list of all the definitions of custom fields.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**context** Context (string)

Filters on context

**Possible values:** [`contact`, `company`, `deal`, `project`, `milestone`, `product`, `invoice`, `subscription`, `ticket`]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`label`, `context`]

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

**Example:**`74855f4a-2b61-429c-81d8-c79ad3675a76`

**context** Context (string)

**Possible values:** [`contact`, `company`, `deal`, `project`, `milestone`, `product`, `invoice`, `subscription`, `ticket`]

**Example:**`contact`

**type** CustomFieldDefinitionType (string)

**Possible values:** [`single_line`, `multi_line`, `single_select`, `multi_select`, `date`, `money`, `auto_increment`, `integer`, `number`, `boolean`, `email`, `telephone`, `url`, `company`, `contact`, `product`, `user`]

**label** string

**group** string

**required** boolean

**Example:**`false`

**configuration** object

**options** object[]

Only returned for `single_select` and `multi_select` types

  * Array [

**id** string

**Example:**`179e1564-493b-4305-8c54-a34fc80920fc`

**value** string

**Example:**`foo`

  * ]

**extra_option_allowed** boolean

**Example:**`true`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "74855f4a-2b61-429c-81d8-c79ad3675a76",  
          "context": "contact",  
          "type": "single_line",  
          "label": "",  
          "group": "",  
          "required": false,  
          "configuration": {  
            "options": [  
              {  
                "id": "179e1564-493b-4305-8c54-a34fc80920fc",  
                "value": "foo"  
              }  
            ],  
            "extra_option_allowed": true  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "74855f4a-2b61-429c-81d8-c79ad3675a76",  
          "context": "contact",  
          "type": "single_line",  
          "label": "",  
          "group": "",  
          "required": false,  
          "configuration": {  
            "options": [  
              {  
                "id": "179e1564-493b-4305-8c54-a34fc80920fc",  
                "value": "foo"  
              }  
            ],  
            "extra_option_allowed": true  
          }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/customFieldDefinitions.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"9c64570b-4ec1-4e03-9662-af904f78f7fa\",\n      \"aa6d2560-63f9-4b2f-bf96-823dc7c34df7\"\n    ]\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"label\"\n    }\n  ]\n}", null, "application/json");  
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
          "9c64570b-4ec1-4e03-9662-af904f78f7fa",
          "aa6d2560-63f9-4b2f-bf96-823dc7c34df7"
        ]
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "label"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
