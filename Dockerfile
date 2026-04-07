FROM php:8.2-cli

WORKDIR /app

COPY backend/ .

RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN composer install --no-dev --optimize-autoloader

# Generate app key if needed (assuming .env not committed)
RUN php artisan key:generate

EXPOSE 10000

CMD php -S 0.0.0.0:10000 -t public
