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

      
        string freshLiveCookie = "ARRAffinity=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; ARRAffinitySameSite=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; .AspNetCore.Antiforgery.cdV5uW_Ejgc=CfDJ8LbtibfgVHBJjONX366BUVm5_HXRK0WcIXigcB2jZuPGr7w3Oal5dwf8N-nMBNCVxovWLA1gYAO1uXJzXx40ZG95ZbyyjAeLGd88RdcuAnLE0Bl0dXViQLJLyu_PLlscKwl-PipdsN2i2MYgmXjYRCA; .AspNetCore.Cookies=CfDJ8LbtibfgVHBJjONX366BUVlycKaM_FvM7EEp_aBFDarX1b5v6TYf5wDbtJ4n6rTnokekAzvEGEBig1pfDedWquhzjUMcgbaJZIv8I6rvmuiujXKLk3JZ2-_XUXXUJWmy-tgIXQQhZWouwfMwfpx5FGTiKyJ7FOqv0wsk4MCGPS32_7PbRArYn3ON6cUsviBPFiL99Z1P3_JQS-Jnyq4zeLF3Jea0x0CdrIIoj9Cgw95UvpV-HiFOwbnnPZZ0pZbFg615oqQZnnUHLOcPYbgrXoEMwxrBgAwpIKosdpu5weqQ4XtIk8S7px_YqlNriVglg_lKpLJS9As69BrlPF-ctitrtYj70A8e6xbzcINKPpjg3WCGnu3a3SP2Q_XkOurA__C3AW5lmOCSKBpLtYTZeTsUSgLds1P1A5WWgpLeIrfimrgBkiOZ6J8wTsob1yD6NMbvQK8P5a0LAS9wz643c2DJOlGD1kz-uwZnm0gWyWHmybECFUFldeED8KwpvC7QW2S20WGrY99jkA-5B6_LxDbmB8YbqwuVqzc4fzuA1G8VKhJwC0QzSEgIWDK9sJEmUhS1xvkCrUyhVwzcShaI69iLfwitA25LoLkeakYHd4TtXEKfDT5oJliYnkPPovM9KDKmN0aIDo2rw9ouMmPZl8-NFnO-g7hDyBTPPSdnLd0kVhY2WY53mqV0ObpHhcLxqY5mP-2LNYsv28XDeaZEa0ji1HhKLZ3MIDrMCnASSgcoF1lxEbcuhSD0Ql7lmRNXPc9KDD3zm0Y7yz-Xe3s-lUyr6nqbUSWUxi_C3RqRqmCBslcBddcs2gaCY96oPQ01nr3OI_VrLfmdVvfgtgC9JJTkIiZW653Hf4Huc51C-eHbE10k38gNPCeqR2K6C6qXUlpKUo4HBsbCnlbwW43P7f2AMcO1iM-joo2ZwneKK8kHHWx2cg_57hzHwIbWgtMvo8iUhkUHghQgV89CKGH0FGXcGZizyI1t64gERYUAhzGmuDOfYo-fiF-7YQWQUZErJgi-O47AszzMg28S8LUMqG17EI5mnX2TO2KbDvX0RpRebHGIeR3DT1C1M_KCTaHn0E7N4HsGWIlQ7XGTSpowKpx9LjvHD9JtdmA7bVFhWOwLbtNFioy_-XTAB3Bfa__zGMKbvpuG7rbhPp8kUz-_07W139pzLJqgWsM8lVYL39c-XzZQaIkMIUSY76glNYXbSqijmpVtjWKs1ZNM018xyIL-T3wkI8c0djQIJ2wvanHDWf6brCuXAqtgRhHa9lEHzftZ0cqjFOsL_eXbWbqQJuoyBddjywG3RO75KbRbLqj5CnCvHXkJqlUFd1k3-PWSkZq4lVsl89e9_EwESi37pkv6vi599AmQxuKhB1_0f3aG98fA_SrHFmiXL1IxL5AxAvK8RgiJKybhF-keg4XL3-70m9XFknwjPfd7ykHLzQf1Ay7Rb93Rcj-uhExk7tK75S3JKZnd0FsxS4KEkhAmzPMYzML6tk6wffANBNIgatoGAI4cgBk0R_Yzi1-mZqa54LRFVyYDySnE7eoCkPDeUGlCtSl49EkMKlTWbz2eEu74XP_XVNQ7_9JbA0qRqNy-4Hfujvl1TFk4cixDp-HVtXKqiGK0t2Qk_kAz7D2ob4mOigP433gKqjc-ZrluxcY3_Cx-Jdap5AcJEQ_bmxKRp76QqCr8eAOOjO5k7J1w0hzOQReJGzmGLS4td7gwSG21sapkq9jrki3mdcmMwzWXAShn4fxlP-GUth5n__lt22IxRJxEjKlMORiEpipL95KNKEf0A0_RLIejHVgXFjyDZ51Qoe4kvfNjsmn0Y1Ndnu9WcBvoPl1dk9qCllOsyxzrL3zfTBu8o0ABh8Nsao8kBDtsIE-Y0-MCjpgNgG4isTvzy_ha9BROPFKMCCdRaBev9ge1FMzVqh0YLpOCeUuJAVw8gg_2c4HHybZY6p42nyxkfryAUcyI9L7rnK3tcjBaWTABXd6JF6c8adw2l04TFgvI_UvOBdwlmwK1U4yC-EajhrrGS5XCyT0DMcPoErTmcF9lOWyADyTqrK5cXYGGnhU_O-xZJ2yHZubrtaWb4MJuyr1g71Gf3xcltyRnzXs7gCMV3Op35DBQJxTzeQO3Dq3wOsNr4jyb8gNNLB0UkyLkumz1HzN5lg4nmJtwGWHiAytRjlJtafZMrP5eXzEpo7Y-YQz_ZBrC3sik5dRnEbvjY0VDIU4RhHGLwh5q9kP8Ut_rxhDBG4PuEDHhZhGrEWKJbPKZxWR0NeGkxXKzcIh2_6RogqeUea4O2XJ9m5JXo3lEg4a1a9C4apX8qTt86XUiwdTC0A2pWaxRtZD5M_oqC3wLHNMBgq3E24U1hAfGn9QScyYFf1ZxFzq3xVzn21g; .AspNetCore.Session=CfDJ8LbtibfgVHBJjONX366BUVn5iaZyMYVEQIhUo3BEPp2mkJLjIz0fk35vBlcgdrq93GinKxwy2EnadOv0s2ho9HjhjFPmlBdCAQA6FdyBXKZFLRq7iLX%2FbPTyarzwzca57ySa3%2FI63Hnvm6MOA9XuNmC8iMR6EBGrchdW0QHEPJQj";

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