# customFieldDefinitions.create

> Source: https://developer.focus.teamleader.eu/docs/api/custom-field-definitions-create

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Custom Fields](/docs/api/custom-fields)
  * customFieldDefinitions.create



# customFieldDefinitions.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/customFieldDefinitions.create

Create a custom field definition.

_**Required scopes:**_ `settings`

## Request​

  * application/json



### Body**required**

**label** stringrequired

**type** CustomFieldDefinitionType (string)required

**Possible values:** [`single_line`, `multi_line`, `single_select`, `multi_select`, `date`, `money`, `auto_increment`, `integer`, `number`, `boolean`, `email`, `telephone`, `url`, `company`, `contact`, `product`, `user`]

**Example:**`single_line`

**context** Context (string)required

**Possible values:** [`contact`, `company`, `deal`, `project`, `milestone`, `product`, `invoice`, `subscription`, `ticket`]

**Example:**`contact`

**configuration** object

    * Use `options` when `type` is one of [`single_select`, `multi_select`]
    * Use `default_value` when `type` is `auto_increment`
    * Use `searchable` when `type` is one of [`single_line`, `company`, `integer`, `number`, `auto_increment`, `email`, `telephone`]

oneOf

    * options
    * default_value
    * searchable

**options** string[]

**default_value** number

**searchable** boolean




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`customFieldDefinition`



    
    
    {  
      "data": {  
        "type": "customFieldDefinition",  
        "id": "526960d3-8d49-4a71-9f62-7b8b74aef058"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "customFieldDefinition",  
        "id": "526960d3-8d49-4a71-9f62-7b8b74aef058"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/customFieldDefinitions.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"label\": \"\",\n  \"type\": \"single_line\",\n  \"context\": \"contact\"\n}", null, "application/json");  
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
      "label": "",
      "type": "single_line",
      "context": "contact"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
