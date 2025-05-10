# 📌 Quy tắc nhánh (Branching Rule)

Cứ làm đúng mô hình này là sạch sẽ, không rối:

- **main** → Chỉ chứa code ổn định để release/production (Không ai đẩy code trực tiếp lên đây)
- **develop** → Code đã test OK (Nơi tổng hợp tất cả tính năng trước khi đẩy lên main)

## Quy trình phát triển tính năng

1. Mỗi thành viên khi làm tính năng tạo nhánh mới từ develop:
           
```bash
git checkout develop
git pull origin develop
git checkout -b username/ten-tinh-nang
```

2. Làm tính năng xong → Commit code rõ ràng (ví dụ: Thêm chức năng đăng nhập)
            
            Quy tắc commit code (RẤT QUAN TRỌNG)

            Mục tiêu: code dễ đọc, dễ hiểu, dễ tracking

            Commit ngắn gọn + đúng ý nghĩa:

            Ví dụ: Tạo giao diện đăng nhập, Sửa lỗi validate số điện thoại

            Không commit nhiều chức năng 1 lúc

            Khi hoàn thành 1 phần hoặc 1 tính năng nhỏ → commit ngay

```bash
git add .
git commit -m "Tạo chức năng đăng ký tài khoản"
```

3. Khi xong Commit → Push nhánh lên GitHub:
```bash
git push origin username/ten-tinh-nang
```


4. Tạo Pull Request (PR) từ nhánh tính năng → vào develop

5. Code Review + Test → Nếu OK → Merge vào develop

6. Merge xong thì Xoá nhánh tính năng (cả local + remote):
```bash
git branch -d username/ten-tinh-nang
git push origin --delete username/ten-tinh-nang
```
