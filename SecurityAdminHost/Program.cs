using System.Net.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

// ১. সার্ভিস ও CORS কনফিগারেশন রেজিস্ট্রেশন
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:54080") // আপনার Vite ফ্রন্টএন্ড পোর্ট
              .WithOrigins("http://localhost:5205")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // সেশন কুকি পাস করার জন্য আবশ্যক
    });
});

builder.Services.AddRazorPages();
builder.Services.AddSpaStaticFiles(options =>
{
    options.RootPath = "../securityadmin/dist";
});

// HttpClient কনফিগারেশন (যেন এটি নিজস্ব কুকি কন্টেইনার দিয়ে আমাদের কাস্টম কুকি ব্লক না করে)
builder.Services.AddHttpClient("AzureProxy")
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        UseCookies = false, // কাস্টম কুকি পাস করার জন্য এটি অত্যন্ত জরুরি
        AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
    });

var app = builder.Build();

app.UseStaticFiles();
app.UseCors(); // UseRouting এর ঠিক উপরে থাকবে
app.UseRouting();

// ২. রিভার্স প্রক্সি মিডলওয়্যার
app.Use(async (context, next) =>
{
    if (context.Request.Path.Value != null &&
        context.Request.Path.Value.StartsWith("/api", StringComparison.OrdinalIgnoreCase))
    {
        var httpClientFactory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
        var httpClient = httpClientFactory.CreateClient("AzureProxy");

        // লাইভ Azure ইউআরএল তৈরি
        var targetUrl = $"https://pechangatesthemaiya.azurewebsites.net{context.Request.Path}{context.Request.QueryString}";
        var requestMessage = new HttpRequestMessage(new HttpMethod(context.Request.Method), targetUrl);

        // POST/PUT/PATCH রিকোয়েস্টের বডি বা ডাটা কপি করা
        if (context.Request.Method != "GET" && context.Request.Method != "HEAD")
        {
            var streamContent = new StreamContent(context.Request.Body);
            requestMessage.Content = streamContent;
        }

        // ব্রাউজার থেকে আসা হেডারগুলো প্রক্সিতে কপি করা
        foreach (var header in context.Request.Headers)
        {
            if (header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Equals("Cookie", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

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

        // Azure সার্ভার ট্রাস্টের জন্য হোস্ট হেডার ফিক্স
        requestMessage.Headers.Host = "pechangatesthemaiya.azurewebsites.net";

        // [NEW FRESH COOKIE]: আপনার সদ্য আপডেট হওয়া তাজা কুকি স্ট্রিং
        string freshLiveCookie = "ARRAffinity=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; ARRAffinitySameSite=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; .AspNetCore.Antiforgery.cdV5uW_Ejgc=CfDJ8LbtibfgVHBJjONX366BUVlX-OXfn4E6tBEPQnYotTOUZsj1y7fM8_PCp0xRQfJ5GIdRIsvSltlyLB57qhGnbeXJzFc_zE8t5aC5g-SJIchI9YSf88ujjqF2Ss43-FhcJVtRjKCxvDM0jpkbgnA_GMw; .AspNetCore.Cookies=CfDJ8LbtibfgVHBJjONX366BUVl4CPUq6-Xn-4dJVgztLE9lG670PpOAV9PavZMaXPFb0tOn68D_xArBXAeQQIbH9tYfOAu95xttmVxVb5kM0GipeD8ZwwZF_u_nK23Sc8EhDrTvRSQ5b1paZCrn6r3GwVuPaNzyKqxLZqGT7bQjeKyftMrTCFopsdfRtYrw3GudxKuO8pu8GRCuiI2Y1Hv_3KHgTJngUaA_u5T7-_zmaqOEXOTPjQ0tm_K97woIc0No3YyiWGFEy6jJRCDgOA5-DjRD4BrnDGPnIgZ-o5IQxq4jqg4RvD6Y-YrUWNOHuBT5LHlHmxYBOt_zqTujPMVohPsxCQLomWnX7bRDrR6yfcLfi6fI6HuJpwhUarHyRyYyVd1GtjZD33jS1KpXA0qX3a-d09s81WWZcuyV3-onnICgqWYO4GDyO4TuMLjONn9HnrOW0mfQPrAg90f1ICIJaNSn7PEtl8MTSr46fZ0xBeSHsp5gUlAlGE9-gpSd9K5SOKT3UKvZjbEqPDwk1Pyg5Df-Tl4LZKTEo6ImbjZfQmxiEgu87boGwYDY3r5Tsa6QhHXrjQrDVOkPGBSHxzMxcXgiZ7HjVDLO-EdeJLj8SYvnqIOW_WuDK3aZXYFIuBgW331NSCo_3BlkXeoLi2GMbeDQIkNkaEuCxaKmz3eWxfpUoqtIcs2ZFPsMARwgJwMlyHyj6VXoekzTdxOEaZi2DEKHLsBURd9p0ojxzYwWvmAVYTP-hGrjLqY994MyaCiM1A9PTHN9PBkjwzYpuvy9XjV3Pdz1me-HYv8-BInOejugQLv9ZvhqARrf0YkbF5XBRPbZU2Y4KDX3hXnWhCRX-jxZHASiFSM5XkfXrE1xLIAUNuhuTmWd4DxbddQjfBokInF7_N7bumsKhciLJWtglM9zuLMslnOXCBXz6DU_c6OxEpZOe1PwSfmYcZJX8MUA9QMf_vLpE8Tf7G5NRSfijX9XTzMsY7rem3gTBX1zoGhotURnsJGo5toMW-3uUV8NYzuVEXojKDLOZU1UHBRYXETqykDCOmuQOKzMjFDlHCNb6Gh3sfWHr3Aqi8bh1iEgba9VHp0--xJk3TCyaXfGMZ-cs5Q_j4V4W61sFwfoLxxOmrN9ZJAiGrP6fn3g6S-5sH0ZUSLAaIOyeQyT0FaNWnba4uZu1h_t9STisTtX-intHkF1QTis0TGjA_lpWXLwak1FLnQc-qFZUxkYof0vKW1Zji1c3IV6SmkKiKJymnMmjShh88z7uI2twGLhy3ynXxn7-wQQIkeGYDMgJG66j5EQ_iuQ3dt1uJyolpeUhOKG9XkTMaeNIo0qq0O5KmtNPhxWyJ13wgq3wSPg_DGJyZReqEaq0cvzj5S98Gphv1oL8_qL2cXKy0Oi5XB7jT3_U3BQgdoJItUco63rH0FW4jIKIDAc3Sxjj9mobIt5kzmZYcKs3_4zc5qLg0mjoD1tsJP6LtsYn_0PCGpnT7bOrsi1aUPWbbcUE_4SlJNlyS2otNN65R1E89HkccAwxItg2CP4sNvwlZdXY22UaK86a22_ee4CPp4E2hf0F5KO3fiFl-HkaLy41MBEl8jfMfxOh7QJ2wasNOgS38MfPRCYB6OeLI-ZzsL6fj6PTb8xvD5Tf_BInNz1x8GloBaEU0bZtZyHgfcDIF1rMo2HzC1L0Mv4gm5cRIOp2iDpYs7vBXT3S5ohbmy6ku5aLwVNyj5Q6xRy9qvol5hWWexL-8FSzGfpyIlpmZgo_1d9SqnmET3PCGiXQSbQa1aIH5Lw9vGnXzhg_ZTSmpB-gCKkI6axn2HCgUnbKsZc3LsYSN6RqzYCd9U7LJTDOtOlJgtK9lHi3qL1SAdA-SIRs-OgRsZlVNLvC9Pt66LCUenippgXVlbOCK-LK8RJugek2_RnE7_RnPAUaF34N46XGut8PmPe9H1T6PK8agCKzf4QnVF6T_4GpiAcEwCyAKrNgvPwgOaBsDojdDBayUYph9gMAcIeROAQhqZErBp2TqlQ_ZJGvjgbacwpYc0nRTH2dS9Jnom21skl2qwBuYCPlRvrevVMnFDiyUd3ay5J8kXmSUvUYlgr6lc_qlMS0LwVMeJRFw0O33nsjnHITz1pBQLfaC7bImMmoBfydOgFwEIH8d6ZWfJVk2lKvu9cpUN-Kq-UNUJfAQxQxlojzyuf2Z6_-GiPMuoTaYOaqnZuElOvGkM-kioxHbtubu8RQj-mOhtpLQIAowbaZsVQFPs6S6tTBcqbXIePL7IysUFnEKYWr9e7fCpvoQ8GPJd9uimPLmy9ORwKKtv6b6davJEyF1zgsMeeY8SvKjiULBw2Fmpat-0PR8OVbjICxWJPXghljNXDaZ3rD1JscZo1H6QakqP_FYelb8A; .AspNetCore.Session=CfDJ8LbtibfgVHBJjONX366BUVnWQraCNyCl6wE%2FUJfy6Zp%2BYnaNgypeNaP0vz%2B%2FARs1nOd5KcOFNPrOBq2MPbfU8cK%2FliF6LFAhSPDoIRx%2BFX8UvfP2CwTciOrec4hNY7Ymu6kghCBiEGSLANexyVfY0u5uKYDW%2BKVNdPi2f5bcfO6q";

        requestMessage.Headers.TryAddWithoutValidation("Cookie", freshLiveCookie);

        // Azure লাইভ সার্ভারে রিকোয়েস্ট পাঠানো
        var responseMessage = await httpClient.SendAsync(requestMessage);

        // রেসপন্স স্ট্যাটাস কোড সেট করা
        context.Response.StatusCode = (int)responseMessage.StatusCode;

        // রেসপন্স হেডারগুলো ব্রাউজারে ব্যাক করার জন্য কপি করা
        foreach (var header in responseMessage.Headers)
        {
            if (header.Key.Equals("Transfer-Encoding", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Equals("Connection", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }
            context.Response.Headers[header.Key] = header.Value.ToArray();
        }

        foreach (var header in responseMessage.Content.Headers)
        {
            context.Response.Headers[header.Key] = header.Value.ToArray();
        }

        // চূড়ান্ত ডাটা ব্রাউজারে পুশ করা
        await responseMessage.Content.CopyToAsync(context.Response.Body);
        return;
    }

    await next();
});





app.MapRazorPages();

if (app.Environment.IsDevelopment())
{
    app.UseSpa(spa =>
    {
        spa.Options.SourcePath = "../securityadmin";

        spa.UseProxyToSpaDevelopmentServer("http://localhost:54080");
    });
}

app.MapFallbackToPage("/admin/{**path}", "/Admin");

app.Run();