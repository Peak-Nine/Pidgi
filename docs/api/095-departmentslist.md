# departments.list

> Source: https://developer.focus.teamleader.eu/docs/api/departments-list

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Departments](/docs/api/departments)
  * departments.list



# departments.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/departments.list

Get a list of departments.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**Example:**`["92296ad0-2d61-4179-b174-9f354ca2157f","53635682-c382-4fbf-9fd9-9506ca4fbcdd"]`

**status** string[]

Filters on status:

    * `active` \- Filters on active departments
    * `archived` \- Filters on archived departments

**Possible values:** [`active`, `archived`]

**sort** object[]

  * Array [

**field** stringrequired
    * `default_department` \- When sorting ascending, default departments are listed first.
    * `name` \- Sorts by department name.
    * `created_at` \- Sorts by department creation date.

**Possible values:** [`default_department`, `name`, `created_at`]

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

**Example:**`67c576e7-7e6f-465d-b6ab-a864f6e5e95b`

**name** string

**Example:**`Human Resources`

**vat_number** string

**Example:**`BE0899623035`

**currency** string

**Example:**`EUR`

**emails** object[]

  * Array [

**type** string

**Possible values:** [`primary`, `invoicing`]

**Example:**`primary`

**email** string

**Example:**`info@piedpiper.eu`

  * ]

**status** string

**Possible values:** [`active`, `archived`]

**Example:**`active`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "67c576e7-7e6f-465d-b6ab-a864f6e5e95b",  
          "name": "Human Resources",  
          "vat_number": "BE0899623035",  
          "currency": "EUR",  
          "emails": [  
            {  
              "type": "primary",  
              "email": "info@piedpiper.eu"  
            }  
          ],  
          "status": "active"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "67c576e7-7e6f-465d-b6ab-a864f6e5e95b",  
          "name": "Human Resources",  
          "vat_number": "BE0899623035",  
          "currency": "EUR",  
          "emails": [  
            {  
              "type": "primary",  
              "email": "info@piedpiper.eu"  
            }  
          ],  
          "status": "active"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/departments.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"92296ad0-2d61-4179-b174-9f354ca2157f\",\n      \"53635682-c382-4fbf-9fd9-9506ca4fbcdd\"\n    ],\n    \"status\": [\n      \"active\"\n    ]\n  },\n  \"sort\": [\n    {\n      \"field\": \"default_department\",\n      \"order\": \"asc\"\n    }\n  ]\n}", null, "application/json");  
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
    
    
    {
      "filter": {
        "ids": [
          "92296ad0-2d61-4179-b174-9f354ca2157f",
          "53635682-c382-4fbf-9fd9-9506ca4fbcdd"
        ],
        "status": [
          "active"
        ]
      },
      "sort": [
        {
          "field": "default_department",
          "order": "asc"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
