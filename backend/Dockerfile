FROM php:8.2-fpm

# Cài các thứ Laravel cần
RUN apt-get update && apt-get install -y \
    nginx supervisor libpng-dev libjpeg-dev libonig-dev libxml2-dev zip unzip git curl \
    && docker-php-ext-install pdo pdo_mysql mbstring exif bcmath gd

# Cài Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Laravel project
WORKDIR /var/www
COPY . .

# Cài Laravel
RUN composer install --no-dev --optimize-autoloader \
    && chown -R www-data:www-data /var/www

# Copy nginx + supervisor config
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisord.conf


EXPOSE 80

# Start cả nginx và php-fpm cùng lúc
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
