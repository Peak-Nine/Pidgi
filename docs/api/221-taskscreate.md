# tasks.create

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-tasks-create

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Tasks](/docs/api/projects-v-2-tasks)
  * tasks.create



# tasks.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/tasks.create

Create a task. All properties except for `title` and `project_id` are optional.

## Request​

  * application/json



### Body**required**

**project_id** stringrequired

**Example:**`49b403be-a32e-0901-9b1c-25214f9027c6`

**title** stringrequired

**Example:**`My task`

**group_id** string

If omitted the task is not added to a group.

**Example:**`0185968b-2c9e-73fd-9ce1-a12c0979783b`

**work_type_id** string

Cannot be null if `billing_method` is `task_type_rate`.

**Example:**`0f517e20-2e76-4684-8d6c-3334f6d7148c`

**task_type_id** string

DEPRECATED - Use `work_type_id` instead.

**Example:**`0f517e20-2e76-4684-8d6c-3334f6d7148c`

**description** string

**Example:**`But nothing is any good without you cause baby you are my centerpiece`

**billing_method** string

**Possible values:** [`user_rate`, `work_type_rate`, `custom_rate`, `fixed_price`, `parent_fixed_price`, `non_billable`]

**Example:**`user_rate`

**fixed_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**custom_rate** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**start_date** string

**Example:**`2023-01-18`

**end_date** string

**Example:**`2023-03-22`

**time_estimated** object

**value** numberrequired

**Example:**`480`

**unit** stringrequired

**Possible values:** [`hours`, `minutes`, `seconds`]

**Example:**`minutes`

**assignees** object[]

  * Array [

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

  * ]




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



    
    
    {  
      "data": {  
        "type": "nextgenTask",  
        "id": "39c64ba9-ebf1-491a-8486-a0b96ff21c07"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "nextgenTask",  
        "id": "39c64ba9-ebf1-491a-8486-a0b96ff21c07"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/tasks.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"project_id\": \"49b403be-a32e-0901-9b1c-25214f9027c6\",\n  \"title\": \"My task\",\n  \"group_id\": \"0185968b-2c9e-73fd-9ce1-a12c0979783b\",\n  \"work_type_id\": \"0f517e20-2e76-4684-8d6c-3334f6d7148c\",\n  \"task_type_id\": \"0f517e20-2e76-4684-8d6c-3334f6d7148c\",\n  \"description\": \"But nothing is any good without you cause baby you are my centerpiece\",\n  \"billing_method\": \"fixed_price\",\n  \"fixed_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"external_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"internal_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"custom_rate\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"start_date\": \"2023-01-18\",\n  \"end_date\": \"2023-03-22\",\n  \"time_estimated\": {\n    \"value\": 480,\n    \"unit\": \"minutes\"\n  },\n  \"assignees\": [\n    {\n      \"type\": \"user\",\n      \"id\": \"66abace2-62af-0836-a927-fe3f44b9b47b\"\n    }\n  ]\n}", null, "application/json");  
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
      "project_id": "49b403be-a32e-0901-9b1c-25214f9027c6",
      "title": "My task",
      "group_id": "0185968b-2c9e-73fd-9ce1-a12c0979783b",
      "work_type_id": "0f517e20-2e76-4684-8d6c-3334f6d7148c",
      "task_type_id": "0f517e20-2e76-4684-8d6c-3334f6d7148c",
      "description": "But nothing is any good without you cause baby you are my centerpiece",
      "billing_method": "fixed_price",
      "fixed_price": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "external_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "internal_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "custom_rate": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "start_date": "2023-01-18",
      "end_date": "2023-03-22",
      "time_estimated": {
        "value": 480,
        "unit": "minutes"
      },
      "assignees": [
        {
          "type": "user",
          "id": "66abace2-62af-0836-a927-fe3f44b9b47b"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
