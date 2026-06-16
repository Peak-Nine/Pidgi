# projectGroups.create

> Source: https://developer.focus.teamleader.eu/docs/api/project-groups-create

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Groups](/docs/api/groups)
  * projectGroups.create



# projectGroups.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projectGroups.create

Create a group. All properties except for `title` and `project_id` are optional.

## Request​

  * application/json



### Body**required**

**project_id** stringrequired

**Example:**`49b403be-a32e-0901-9b1c-25214f9027c6`

**title** stringrequired

**Example:**`My project group`

**description** string

**Example:**`Some long-winded description`

**color** Color (string)

**Possible values:** [`#00B2B2`, `#008A8C`, `#992600`, `#ED9E00`, `#D157D3`, `#A400B2`, `#0071F2`, `#004DA6`, `#64788F`, `#C0C0C4`, `#82828C`, `#1A1C20`]

**Example:**`#00B2B2`

**billing_method** string

**Possible values:** [`time_and_materials`, `fixed_price`, `parent_fixed_price`, `non_billable`]

**fixed_price** objectnullable

Only allowed if the billing_method is fixed_price, or the group is already fixed_price.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

Also known as "budget". Value set by user to compare with price. Only allowed if the billing_method is time_and_materials, or the group is already time_and_materials.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

Also known as "cost budget". Value set by user to compare with cost.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**start_date** string

**Example:**`2023-01-18`

**end_date** string

**Example:**`2023-03-22`

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
        "type": "nextgenProjectGroup",  
        "id": "39c64ba9-ebf1-491a-8486-a0b96ff21c07"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "nextgenProjectGroup",  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projectGroups.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"project_id\": \"49b403be-a32e-0901-9b1c-25214f9027c6\",\n  \"title\": \"My project group\",\n  \"description\": \"Some long-winded description\",\n  \"color\": \"#00B2B2\",\n  \"fixed_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"external_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"internal_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"start_date\": \"2023-01-18\",\n  \"end_date\": \"2023-03-22\",\n  \"assignees\": [\n    {\n      \"type\": \"user\",\n      \"id\": \"66abace2-62af-0836-a927-fe3f44b9b47b\"\n    }\n  ]\n}", null, "application/json");  
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
      "title": "My project group",
      "description": "Some long-winded description",
      "color": "#00B2B2",
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
      "start_date": "2023-01-18",
      "end_date": "2023-03-22",
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
