using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.IO;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.SpaServices;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddHttpClient("AzureProxy");

// Service and CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5205")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors();
app.UseRouting();
app.UseAuthorization();

app.MapRazorPages();


app.Use(async (context, next) =>
{
    if (context.Request.Path.Value?.StartsWith("/api", StringComparison.OrdinalIgnoreCase) == true)
    {
        var httpClientFactory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
        var httpClient = httpClientFactory.CreateClient("AzureProxy");

        var targetUrl = $"https://pechangatesthemaiya.azurewebsites.net{context.Request.Path}{context.Request.QueryString}";
        var requestMessage = new HttpRequestMessage(new HttpMethod(context.Request.Method), targetUrl);

        
        if (!HttpMethods.IsGet(context.Request.Method) &&
            !HttpMethods.IsHead(context.Request.Method) &&
            !HttpMethods.IsDelete(context.Request.Method))
        {
            context.Request.EnableBuffering();
            var streamContent = new StreamContent(context.Request.Body);
            requestMessage.Content = streamContent;
        }

        foreach (var header in context.Request.Headers)
        {
            if (header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Equals("Cookie", StringComparison.OrdinalIgnoreCase)) 
                continue;

            if (header.Key.StartsWith("Content-", StringComparison.OrdinalIgnoreCase))
            {
                if (requestMessage.Content != null)
                {
                    requestMessage.Content.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }
            else
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        requestMessage.Headers.Host = "pechangatesthemaiya.azurewebsites.net";

      
        string freshLiveCookie = "ARRAffinity=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; ARRAffinitySameSite=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; .AspNetCore.Antiforgery.cdV5uW_Ejgc=CfDJ8LbtibfgVHBJjONX366BUVnVY2WK7sEPaXDxHUyZndgkzgddRrEWaa9ZhmMAzNWURvEor7BpqTVD9UdX3R742rWcpa3R-Yjw4rLuroX6GTsVleWMdBVdpy6xOEIgrR6VEhhkt1nnirE8E-qnzacgdZ4; .AspNetCore.Cookies=CfDJ8LbtibfgVHBJjONX366BUVkklsApfjQzK60uawIzELpbcTMDXAXmxxD759Fbxg6ISdwXhKUD4gwFWknZXRccw6qjbGopyXxJTWgV5FnMPVgx8zUds_IfPpIRF0dNAE2051Hl1u67mm7CvmfX5ifNEp19ub0cilTsOVf1pUmLEWqENYG60oBQyvh_XCbK8UsK6lJod_qGZJMO05RW755fNRCsobEH1lI7WxLHo0zKVz58NgTNh2t4NP6pZPBpvwr-VEOVKW2k0k7d-cYe--_L5S3q4ZmPL1VhISM_yXLndRfIxAAamTRO1hWsl62Qd2lvIPMgsYWNqQLPOWw3WGJdGXl7XaiLlnG8vLWrf2qsBrcXZzYaLEpPLeqGTOpJsSfreNY9iRKhRtRASe6wceRxPUo8nCHxw95W9BUc8B1DQ_x7s_F37TIsdYlQEzgrs8ypWviQe7Mjf69K5DUoQHccoimegdAaHKwA4ZMkaomhsVei3cm5S8vEHXstYfNt1PWMSb-seOmWT6pubuil-zetIiYFO627sZaquh7PveaAHBPTo0Vh8w34HgNm8TD_GCMqC2r-d3ApXEWv_CPqhgv3Uf4qJ8QgU0Nz4vS1iU-INhHAuqPzNCEuHGNZVm0j0nYLuXZeEbIbzMvOzPMIDrl4eoFeaEnV2HwO81g0mfzRJBYB75WASf67xFJ5RU5ic0X9hvnsf6oZM4uVzAk5W4Y4wm3sQrqxKFRuf1lYB6txGLsgxMovTbdv9QySIRUII_u2QaBW8yaAXWpjHetvJS4BZ0s5wnJyomjHiK8zFQaN_8scotdtGb6gdD0-XT8qbzDcPbOfWw3TFaSMMF0hFuvhnMO2S5k3QYC0VAHLM6jpPcmTEvLLKsGy62GIrUc7ylMIdvcuWgWRTKxuYKZLt8tLTTyrFglOXDaLHZaDRhnXGpMwpo0oMNXrXBDK7HQ7FliDGHSmEMpwYGRsMlaGgqwZrOcjP0-hqZF3HLFUVFdHZBzG8KjrYsqtGVHySlyRyND7kAKbG3D5e1FiYJp1bExDBsKCjEgjFPFbkEpSOlLchjefgAo9ol9lspQcA97xFQKDREKFzZrqS3FaTSkixTvEDNCdeeywBYW_UOAZxOr-zALhi_UTbin1oa0xIbPxjLGHLCwj3Lky35UdCpwq5IBr7WlBdfr-Fa9Qy4Opkbng8P8eUGbuh1WNq9X6MfSCsFaYrg-Wg8Is9dkkHhD3HFkMAZgo_KcJqqIcoHiFcXDo3ePzzU-elLS5uyNxGIi9eMh03VUvrY0TqRN6E6FYqRHZLA1ygnR4lIAQo5CXhcrstL-8f0VVOvSlcrmyZVGNMBHGGpceNrk8XyKO3eIhf8PbR7wFMXaVaKNVSlkuOr2RU8PXr7A5Wy1ITJqKuw07hnOVGeP3CMstC79JOx-Vy8wSTj0v5xp8R5mzDybUvWt21h8jTZsmlok8j4oJ8sX7GhaAi1_i02ukNL9IQQPN_YyxAZUSOOTNH-cltQ9_2lGGtDkY2qLepg_AJjUkjvfv1CiPtvq_ASXYKPmNiDE07W7BVPhH60ryinIlaFlsnpkJiQFsFm7ldCOrav56a78QNzsF6TsTSSH_YuGzuNffupW_DidRDkRjT6Xqz-gju21Iiy_uLj5K1BnVg_tDC73kaDFT4BWk3KCG9UKU-SzfkXAf3pIM9FDm-ACHPZx23L9hJN_PIoNp5LD2suYzpqrSLSEURKc3m5gvli7USHFaX73eB1EWtUQdMICm6BRxzl6EpNFURAOk5OFlg0X_gaBa6p8h3SVHONFBCQUeYRsMCi-tRJt-tSJ2c1y8g4KffdNHkVp32ulLcTUp9kETrPH9EjuT3aV10QWeMzh_ILk6sG2SjopXtHxYgUU_YZrMbEWsJ8ShF1v34purmQpFW4SnyUJDPypwAqW60d0nF7bEifNBjG0GhAr8wmn0IzOYKwlWaJ1wEDD24EPlfIpLhFlojaUCp6DC0Qisy16DS8p6PLr6SVp1bnZsMh09v9xjcbJkioQodbG-OfjqQn_D-moU8d17FobsvbSWCg-oYn8l0QkqQzBvOPpqUpJKQKbc5UN1Yol8qJVoY5pxnyB55wvXPGpeTV9lJWAg2zXUg8lxHxzCupdd6k_ZF9pi8o4TYw8iqP-3CbS6nQpdoZys-VZuz0MygTFU178JW-1z-M4lXIeRAzO1JugXtWb_qxLpSj2jWzLSC7me8pJZhfAC9IEJQodLZWlIvHZtN88QaBBHBZNu-XvhpT4XcY9lb70bIMNh8bqAZnI1xlPsVXapm1s6IGAlTWZO7IlgrDqJe8jBnOxQpkmPPDN_wdI2bGC4_B6-bxqP00GKNYab0QZ2FWfO1RryirQuwNfvF4Q_dR7zyPiAPZI; .AspNetCore.Session=CfDJ8LbtibfgVHBJjONX366BUVl2ohK8nn1e495n9Wo1Y5kVAfKp0%2FUK1r%2BZXC0LBmUKOLSl6OLyMwJbOryPh5qqu%2FKcce4mJk3ESY2UCm0xyzGYHvFarpiWRjEDvhCsJmK6WicT6QA4aUo7LbQ%2BT4it%2BYdoUurRs1E%2Bc28EMTsPUiCA";

        requestMessage.Headers.TryAddWithoutValidation("Cookie", freshLiveCookie);

        var responseMessage = await httpClient.SendAsync(requestMessage);

        context.Response.StatusCode = (int)responseMessage.StatusCode;

        foreach (var header in responseMessage.Headers)
        {
            if (!header.Key.Equals("Transfer-Encoding", StringComparison.OrdinalIgnoreCase) &&
                !header.Key.Equals("Connection", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }
        }

        foreach (var header in responseMessage.Content.Headers)
        {
            context.Response.Headers[header.Key] = header.Value.ToArray();
        }

        await responseMessage.Content.CopyToAsync(context.Response.Body);
        return;
    }

    await next();
});


app.MapWhen(context => context.Request.Path.StartsWithSegments("/admin"), adminApp =>
{
    adminApp.UseStaticFiles();

    adminApp.UseSpa(spa =>
    {
        if (app.Environment.IsDevelopment())
        {
        
            spa.UseProxyToSpaDevelopmentServer("http://localhost:54080");
        }
        else
        {
            spa.Options.SourcePath = "wwwroot/admin";
        }
    });
});

app.MapFallbackToFile("admin/index.html");

app.Run();